export default function ErrorMessage({ error }) {
  return error
    ? <div className="game-error">{error}</div>
    : null;
}