
const personColors = ["#eae6fb", "#e3eee6", "#faeadb", "#e8edf4", "#f4e3e8"];
export function Avatar({
  name,
  index = 0,
  small = false,
}: {
  name: string;
  index?: number;
  small?: boolean;
}) {
  return (
    <span
      className={"avatar " + (small ? "small" : "")}
      style={{ background: personColors[index % personColors.length] }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
