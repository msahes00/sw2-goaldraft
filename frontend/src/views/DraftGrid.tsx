import '../styles/DraftGrid.css';

type Player = {
  id: number;
  name: string;
  position: string;
  imageId: number;
};

type DraftGridProps = {
  slots: (Player | null)[];
  formationPositions: string[];
};

const MID_POSITIONS = ["CM", "CDM", "CAM", "DEM", "MCO", "MI", "MD"];
const FW_POSITIONS = ["ST", "CF", "LW", "RW", "LF", "RF"];
const DEF_POSITIONS = ["LB", "CB", "RB", "LWB", "RWB"];

export default function DraftGrid({ slots, formationPositions }: DraftGridProps) {
  const positionToSlot: Record<string, Player | null> = {};
  formationPositions.forEach((pos, i) => {
    positionToSlot[pos + i] = slots[i];
  });

  const groupIndices = (accepted: string[]) =>
    formationPositions.map((pos, i) => (accepted.includes(pos) ? i : -1)).filter(i => i !== -1);

  const forwardsIndices = groupIndices(FW_POSITIONS);
  const midfieldersIndices = groupIndices(MID_POSITIONS);
  const defendersIndices = groupIndices(DEF_POSITIONS);
  const goalkeeperIndex = formationPositions.findIndex(pos => pos === "GK");

  return (
    <div className="draftgrid-container">
      <h2 style={{ textAlign: 'center', fontSize: '1.5rem', marginBottom: '1rem' }}>Alineación</h2>

      <LineRow indices={forwardsIndices} positions={formationPositions} map={positionToSlot} title="Delanteros" />
      <LineRow indices={midfieldersIndices} positions={formationPositions} map={positionToSlot} title="Centrocampistas" />
      <LineRow indices={defendersIndices} positions={formationPositions} map={positionToSlot} title="Defensas" />

      {goalkeeperIndex !== -1 && (
        <div className="line-group">
          {renderSlot("GK", positionToSlot, goalkeeperIndex)}
        </div>
      )}
    </div>
  );
}

function LineRow({
  indices,
  positions,
  map,
  title
}: {
  indices: number[];
  positions: string[];
  map: Record<string, Player | null>;
  title: string;
}) {
  if (indices.length === 0) return null;

  return (
    <div className="line-group">
      <div className="line-title">{title}</div>
      {indices.map(i => renderSlot(positions[i], map, i))}
    </div>
  );
}

function renderSlot(pos: string, map: Record<string, Player | null>, idx: number) {
  const key = pos + idx;
  const player = map[key];

  return (
    <div key={key} className="slot-card">
      {player ? (
        <>
          <img src={`/api/players/${player.id}/image`} alt={player.name} />
          <p className="slot-name">{player.name}</p>
          <p className="slot-pos">{player.position}</p>
        </>
      ) : (
        <div className="text-center">
          <p className="slot-name">{pos}</p>
          <p className="slot-pos">Vacío</p>
        </div>
      )}
    </div>
  );
}
