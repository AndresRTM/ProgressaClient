import Icon from '../../components/Icon'
import './sportPictures.css'

export default function SportPicture({
  sport,
  picture,
  size = 44,
  editable = false,
  onClick,
  className = '',
}) {
  const style = { '--picture-size': `${size}px`, '--sport-color': sport.color }
  const content =
    picture?.type === 'image' ? (
      <img src={picture.src} alt="" draggable={false} />
    ) : (
      <Icon name={picture?.icon || sport.icon} size={Math.round(size * 0.62)} />
    )
  const classes = `sport-picture${editable ? ' sport-picture--editable' : ''} ${className}`

  if (editable) {
    return (
      <button
        type="button"
        className={classes}
        style={style}
        onClick={onClick}
        aria-label={`Change picture for ${sport.label}`}
      >
        {content}
        <span className="sport-picture-edit">
          <Icon name="edit" size={9} />
        </span>
      </button>
    )
  }

  return (
    <span className={classes} style={style} aria-hidden="true">
      {content}
    </span>
  )
}
