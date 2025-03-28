import React, { ReactElement } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { TableHead } from '@mui/material';
import { calcularTempoFora, formatTimeFromMilliseconds } from './TimeUtils';
import Participante from './Participante';

interface CustomTooltipWithTableProps {
  participante: Participante;
  children: ReactElement; // Alterado de ReactNode para ReactElement
}
const CustomTooltipWithTable = ({ participante, children }: CustomTooltipWithTableProps) => {
  if (!participante.saidas || participante.saidas.length === 0) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      title={
        <Paper elevation={3} sx={{ padding: '8px' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Evento</strong></TableCell>
                  <TableCell><strong>Horário</strong></TableCell>
                  <TableCell><strong>Tempo Fora</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participante.saidas.map((saida) => (
                  <React.Fragment key={saida.sequencia}>
                    <TableRow>
                      <TableCell>Saída #{saida.sequencia}</TableCell>
                      <TableCell>{formatTimeFromMilliseconds(saida.horarioDeSaida)}</TableCell>
                      <TableCell>
                        {saida.horarioDeRetorno 
                          ? calcularTempoFora(saida.horarioDeSaida, saida.horarioDeRetorno)
                          : "--"
                        }
                      </TableCell>
                    </TableRow>
                    {saida.horarioDeRetorno && (
                      <TableRow>
                        <TableCell>Retorno #{saida.sequencia}</TableCell>
                        <TableCell>{formatTimeFromMilliseconds(saida.horarioDeRetorno)}</TableCell>
                        <TableCell>--</TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      }
      arrow
      placement="top"
    >
      {children}
    </Tooltip>
  );
};

export default CustomTooltipWithTable;