import useCountUp from '../hooks/useCountUp';

export default function AnimatedNumber({
  end,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  enabled = true,
}) {
  const v = useCountUp(end, { duration, enabled });
  const text =
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toLocaleString('en-IN');

  return (
    <span className={className}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
