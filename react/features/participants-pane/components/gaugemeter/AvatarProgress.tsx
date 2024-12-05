import React, { useState, useEffect } from 'react';
import ProgressBar from "@ramonak/react-progress-bar";
import Participant from "./Participante";
import DataBaseForGauge from './DataBaseForGauge';

const database = new DataBaseForGauge();

interface AvatarProgressChartProps {
 // database: DataBaseForGauge;
}

const AvatarProgress: React.FC<AvatarProgressChartProps> = ({ }) => {
  const [participantsProgress, setParticipantsProgress] = useState<Participant[]>([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const participants = await database.getParticipantesPercentualAcumuloFala();
      setParticipantsProgress(participants);
    };

    fetchParticipants();

    const interval = setInterval(async () => {
      const participants = await database.getParticipantesPercentualAcumuloFala();
      console.log(`=== AvatarProgress === 1.Lista de participantes para serem processados`, participants);
      setParticipantsProgress((prevParticipants) =>
        participants.map((participant) => ({
          ...participant,
          percentualAcumuloFala: isNaN(participant.percentualAcumuloFala) || participant.percentualAcumuloFala < 0 
            ? 0 
            : participant.percentualAcumuloFala     
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {participantsProgress.map((participant) => (
        <div key={participant.id}>
          <span style={{ marginRight: '10px' }}>{participant.name}</span>
          <ProgressBar
            completed={participant.percentualAcumuloFala.toFixed(1)}
            customLabel={`${participant.percentualAcumuloFala.toFixed(1)}%`}
            labelAlignment="outside"
            labelColor="white"
            bgColor="#ef6c00"
          />
        </div>
      ))}
    </div>
  );
};

export default AvatarProgress;
