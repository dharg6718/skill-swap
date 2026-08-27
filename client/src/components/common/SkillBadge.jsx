import { CATEGORY_COLORS } from '../../utils/constants';

const SkillBadge = ({ skill, size = 'md' }) => {
  if (!skill) return null;
  
  const categoryColor = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.Other;
  
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <span className={`inline-block rounded-full font-medium ${categoryColor} ${sizes[size]}`}>
      {skill.name}
    </span>
  );
};

export default SkillBadge;
