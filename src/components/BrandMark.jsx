import './brandMark.css'

export default function BrandMark({ size = 28 }) {
  return (
    <img
      className="brand-mark"
      src="/favicon.svg"
      alt=""
      width={size}
      height={size}
    />
  )
}
