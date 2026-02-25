const AVATARS = [
  { id: 'bear', emoji: '🐻', label: 'Bear' },
  { id: 'cat', emoji: '🐱', label: 'Cat' },
  { id: 'dog', emoji: '🐶', label: 'Dog' },
  { id: 'fox', emoji: '🦊', label: 'Fox' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'owl', emoji: '🦉', label: 'Owl' },
  { id: 'panda', emoji: '🐼', label: 'Panda' },
  { id: 'penguin', emoji: '🐧', label: 'Penguin' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit' },
  { id: 'unicorn', emoji: '🦄', label: 'Unicorn' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
  { id: 'star', emoji: '⭐', label: 'Star' },
];

const sizeClasses = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-14 h-14 text-3xl',
  lg: 'w-20 h-20 text-5xl',
};

const bgColors = [
  'bg-kid-pink/20',
  'bg-kid-purple/20',
  'bg-kid-blue/20',
  'bg-kid-green/20',
  'bg-kid-yellow/20',
  'bg-kid-orange/20',
];

function getAvatarEmoji(avatarUrl) {
  const avatar = AVATARS.find((a) => a.id === avatarUrl);
  return avatar ? avatar.emoji : '😊';
}

function getBgColor(name) {
  if (!name) return bgColors[0];
  const index = name.charCodeAt(0) % bgColors.length;
  return bgColors[index];
}

export default function Avatar({ avatarUrl, name, size = 'md' }) {
  return (
    <div
      className={`${sizeClasses[size]} ${getBgColor(name)} rounded-full flex items-center justify-center flex-shrink-0`}
    >
      {getAvatarEmoji(avatarUrl)}
    </div>
  );
}

export { AVATARS };
