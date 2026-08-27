const User = require('../models/User');

exports.findMatches = async (currentUser, options = {}) => {
  // Find all active users except current user
  const users = await User.find({ _id: { $ne: currentUser._id }, isActive: true })
    .populate('skillsKnown')
    .populate('skillsWanted')
    .lean();

  const matches = [];

  const myWantedIds = currentUser.skillsWanted.map(s => s._id ? s._id.toString() : s.toString());
  const myKnownIds = currentUser.skillsKnown.map(s => s._id ? s._id.toString() : s.toString());

  for (const candidate of users) {
    const candidateKnownIds = candidate.skillsKnown.map(s => s._id.toString());
    const candidateWantedIds = candidate.skillsWanted.map(s => s._id.toString());

    // Skills I want that candidate knows
    const outgoingMatchIds = myWantedIds.filter(id => candidateKnownIds.includes(id));
    // Skills candidate wants that I know
    const incomingMatchIds = candidateWantedIds.filter(id => myKnownIds.includes(id));

    if (outgoingMatchIds.length > 0 || incomingMatchIds.length > 0) {
      const skillsYouCanLearn = candidate.skillsKnown.filter(s => outgoingMatchIds.includes(s._id.toString()));
      const skillsYouCanTeach = candidate.skillsWanted.filter(s => incomingMatchIds.includes(s._id.toString()));

      // Calculate score
      let score = (outgoingMatchIds.length + incomingMatchIds.length) * 10;
      score += (candidate.rating || 0) * 2;
      
      let profileBonus = 0;
      if (candidate.bio) profileBonus += 2;
      if (candidate.location) profileBonus += 1;
      if (candidate.avatar) profileBonus += 2;
      
      score += Math.min(profileBonus, 5);
      
      if (score > 100) score = 100;

      matches.push({
        user: {
          _id: candidate._id,
          name: candidate.name,
          avatar: candidate.avatar,
          bio: candidate.bio,
          location: candidate.location,
          rating: candidate.rating,
          totalReviews: candidate.totalReviews
        },
        matchScore: score,
        skillsYouCanTeach,
        skillsYouCanLearn
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.matchScore - a.matchScore);
  
  return matches;
};
