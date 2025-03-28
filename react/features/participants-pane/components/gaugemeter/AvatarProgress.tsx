import React, { useState, useEffect } from 'react';
import ProgressBar from "@ramonak/react-progress-bar";
import Participant from "./Participante";
import dataBaseForGauge from './DataBaseForGauge';
import CustomTooltipWithTable from './ToolTipWithTable';
import { formatTimeFromMilliseconds } from './TimeUtils';

interface AvatarProgressChartProps {
  // database: DataBaseForGauge;
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
    }, 5790) // intervalo de 11 segundos para a linha de progresso;

    // Certifique-se de limpar o intervalo quando não for mais necessário
    // clearInterval(interval);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {participantsProgress.map((participant) => (
        <div key={participant.id}>
          <CustomTooltipWithTable participante={participant}>
          <span
            style={{
              marginRight: '10px',
              fontSize: '11px',
              color: participant.isOut ? 'red' : 'inherit', // Vermelho se isOut=true
              fontWeight: participant.isOut ? 'bold' : 'normal', // Opcional: negrito
            }}
            title="Nome do participante | Tempo de Fala | Tempo de Presença" >
            {participant.name} | {formatTimeFromMilliseconds(participant.tempoDeFala)} | {formatTimeFromMilliseconds(participant.tempoPresenca)}
          </span>
          </CustomTooltipWithTable>
          <ProgressBar
            completed={participant.percentualAcumuloFala.toFixed(1)}
            customLabel={`${participant.percentualAcumuloFala.toFixed(1)}%`}
            labelAlignment="outside"
            labelColor="white"
            labelSize="11px"
            bgColor={participant.isOut ? '#ff0000' : '#ef6c00'} // Vermelho se isOut=true
          />
          <span>
            &nbsp;
          </span>
        </div>
      ))}
    </div>
  );
};

export default AvatarProgress;


