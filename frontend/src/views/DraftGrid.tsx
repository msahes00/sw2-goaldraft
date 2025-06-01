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
    <div className="w-full max-w-4xl mx-auto mt-6 p-4 bg-green-600 rounded-xl shadow-xl text-white">
      {/* Delanteros */}
      <div className="flex justify-around mb-6">
        {forwardsIndices.map(i => renderSlot(formationPositions[i], positionToSlot, i))}
      </div>

      {/* Centrocampistas */}
      <div className="flex justify-around mb-6">
        {midfieldersIndices.map(i => renderSlot(formationPositions[i], positionToSlot, i))}
      </div>

      {/* Defensas */}
      <div className="flex justify-around mb-6">
        {defendersIndices.map(i => renderSlot(formationPositions[i], positionToSlot, i))}
      </div>

      {/* Portero */}
      <div className="flex justify-center">
        {goalkeeperIndex !== -1 && renderSlot("GK", positionToSlot, goalkeeperIndex)}
      </div>
    </div>
  );
}

function renderSlot(pos: string, map: Record<string, Player | null>, idx: number) {
  const key = pos + idx;
  const player = map[key];

  return (
    <div
      key={key}
      className="w-24 h-32 border-2 border-white border-dashed rounded-lg flex flex-col items-center justify-center bg-white text-black shadow-md"
    >
      {player ? (
        <>
          <img
            src={`/api/players/${player.id}/image`}
            alt={player.name}
            className="w-16 h-16 object-cover rounded-full"
          />
          <p className="text-xs text-center mt-1">{player.name}</p>
          <p className="text-[10px] text-gray-500">{player.position}</p>
        </>
      ) : (
        <div className="text-center">
          <p className="font-bold">{pos}</p>
          <p className="text-xs text-gray-400">Vacío</p>
        </div>
      )}
    </div>
  );
}
