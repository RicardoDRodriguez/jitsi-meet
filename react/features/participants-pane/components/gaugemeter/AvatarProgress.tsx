import React, { useState, useEffect } from 'react';
import ProgressBar from "@ramonak/react-progress-bar";
import Participant from "./Participante";
import dataBaseForGauge from './DataBaseForGauge';

interface AvatarProgressChartProps {
  // database: DataBaseForGauge;
}

function getFormatTime(milliseconds: number): string {
  try {
    if (typeof milliseconds !== 'number' || isNaN(milliseconds)) {
      throw new Error('==== 0. Participante.ts - Erro em formatar campo de minutos e segundos');
    }
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  } catch (error) {
    console.error(error.message);
    return '0m 0s';
  }
}

const AvatarProgress: React.FC<AvatarProgressChartProps> = ({ }) => {
  const [participantsProgress, setParticipantsProgress] = useState<Participant[]>([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      const participants = await dataBaseForGauge.getParticipantesPercentualAcumuloFala();
      setParticipantsProgress(participants);
    };

    fetchParticipants();


    const interval = setInterval(async () => {
      const participants = await dataBaseForGauge.getParticipantesPercentualAcumuloFala();
      console.log(`=== AvatarProgress === 1.Lista de participantes para serem processados`, participants);
      setParticipantsProgress((prevParticipants) =>
        participants.map((participant) => ({
          ...participant,
          percentualAcumuloFala: isNaN(participant.percentualAcumuloFala) || participant.percentualAcumuloFala < 0
            ? 0
            : participant.percentualAcumuloFala
        }))
      );
    }, 1000);

    // Certifique-se de limpar o intervalo quando não for mais necessário
    // clearInterval(interval);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {participantsProgress.map((participant) => (
        <div key={participant.id}>
          <span
            style={{ marginRight: '10px', fontSize: '11px' }}
            title="Nome do participante | Tempo de Presença | Tempo de Fala">
            {participant.name} | {getFormatTime(participant.tempoPresenca)} | {getFormatTime(participant.tempoDeFala)}
          </span>
          <ProgressBar
            completed={participant.percentualAcumuloFala.toFixed(1)}
            customLabel={`${participant.percentualAcumuloFala.toFixed(1)}%`}
            labelAlignment="outside"
            labelColor="white"
            labelSize="11px"
            bgColor="#ef6c00"
          />
        </div>
      ))}
    </div>
  );
};

export default AvatarProgress;
