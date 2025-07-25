import React, { useState } from 'react';
import type { NextPage } from 'next';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';

const DamageCalcPage: NextPage = () => {
  const [level, setLevel] = useState(50);
  const [attack, setAttack] = useState(100);
  const [defense, setDefense] = useState(100);
  const [power, setPower] = useState(60);
  const [damage, setDamage] = useState<number | null>(null);

  const calculate = () => {
    const dmg = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50) + 2;
    setDamage(dmg);
  };

  return (
    <FullBleedWrapper>
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Damage Calculator</h1>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Level</label>
            <input
              type="number"
              className="w-full border rounded p-2 text-black"
              value={level}
              onChange={e => setLevel(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Attack</label>
            <input
              type="number"
              className="w-full border rounded p-2 text-black"
              value={attack}
              onChange={e => setAttack(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Defense</label>
            <input
              type="number"
              className="w-full border rounded p-2 text-black"
              value={defense}
              onChange={e => setDefense(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Move Power</label>
            <input
              type="number"
              className="w-full border rounded p-2 text-black"
              value={power}
              onChange={e => setPower(Number(e.target.value))}
            />
          </div>
          <button
            onClick={calculate}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded"
          >
            Calculate
          </button>
        </div>
        {damage !== null && (
          <p className="mt-4 text-lg font-semibold">Estimated Damage: {damage}</p>
        )}
      </div>
    </FullBleedWrapper>
  );
};

export default DamageCalcPage;
