import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Saida from './Saida';
import Participante from './Participante';

const CustomTooltipWithTable = ({ participante }: { participante: Participante }) => {
  return (
    <Tooltip
      title={
        <Paper elevation={3}>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {participante.saidas?.map((saida) => (
                  <React.Fragment key={saida.sequencia}>
                    <TableRow>
                      <TableCell>Saída #{saida.sequencia}</TableCell>
                      <TableCell>
                        {new Date(saida.horarioDeSaida).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                    {saida.horarioDeRetorno && (
                      <TableRow>
                        <TableCell>Retorno #{saida.sequencia}</TableCell>
                        <TableCell>
                          {new Date(saida.horarioDeRetorno).toLocaleTimeString()}
                        </TableCell>
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
      placement="top">
      <div style={{ padding: '8px', background: '#f0f0f0', cursor: 'pointer' }}>
        Histórico de saídas
      </div>
    </Tooltip>
  );
};

export default CustomTooltipWithTable;