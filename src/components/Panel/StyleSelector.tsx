import type { VisualStyle } from '../Canvas/VisualizationCanvas';

interface StyleSelectorProps {
  currentStyle: VisualStyle;
  onStyleChange: (style: VisualStyle) => void;
}

const styles = [
  { id: 'starcloud' as VisualStyle, label: '星云', icon: '✨', color: '#9966ff' },
  { id: 'aurora' as VisualStyle, label: '极光', icon: '🌌', color: '#00ff88' },
  { id: 'fire' as VisualStyle, label: '火焰', icon: '🔥', color: '#ff4400' },
  { id: 'crystal' as VisualStyle, label: '水晶', icon: '💎', color: '#00ccff' },
  { id: 'neural' as VisualStyle, label: '神经网络', icon: '🔮', color: '#8800ff' },
  { id: 'bubble' as VisualStyle, label: '气泡', icon: '🫧', color: '#ffb3d9' },
];

export default function StyleSelector({ currentStyle, onStyleChange }: StyleSelectorProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ color: '#888', fontSize: '14px', marginBottom: '12px' }}>
        选择视觉风格
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px'
      }}>
        {styles.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleChange(style.id)}
            style={{
              padding: '12px 4px',
              border: currentStyle === style.id
                ? `2px solid ${style.color}`
                : '2px solid transparent',
              borderRadius: '12px',
              background: currentStyle === style.id
                ? `${style.color}20`
                : 'rgba(255, 255, 255, 0.05)',
              color: currentStyle === style.id ? style.color : '#888',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: '20px' }}>{style.icon}</span>
            <span style={{ fontSize: '12px' }}>{style.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
