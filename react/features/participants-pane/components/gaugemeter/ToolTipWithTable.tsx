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
import Saida from './Saida';

interface CustomTooltipWithTableProps {
  participante: Participante;
  children: ReactElement; // Alterado de ReactNode para ReactElement
}
const CustomTooltipWithTable = ({ participante, children }: CustomTooltipWithTableProps) => {
  if (! participante.saidas || participante.saidas.length === 0) {
    return <>{children}</>;
  }

  return (
    <Tooltip
      title={
        <Paper elevation={3} sx={{
          padding: '12px',  // Reduzido de 16px
          borderRadius: '8px',
          transform: 'scale(1.05)',  // Reduzido de 1.1
          transformOrigin: 'top center'
        }}>
          <TableContainer sx={{
            maxWidth: 'none',
            width: 'auto'
          }}>
            <Table sx={{
              border: '1px solid #e0e0e0',
              '& .MuiTableCell-root': {
                padding: '12px 18px',  // Reduzido de 16px 24px
                fontSize: '0.875rem', // Reduzido de 1rem (tamanho original)
                lineHeight: '1.4',     // Ajustado
                minWidth: '100px'      // Reduzido de 120px
              },
              '& .MuiTableRow-root': {
                height: '48px'         // Reduzido de 60px
              }
            }}>
              <TableHead>
                <TableRow sx={{
                  backgroundColor: '#1976d2',
                  '& .MuiTableCell-root': {
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.9375rem'  // Reduzido de 1.1rem
                  }
                }}>
                  <TableCell sx={{ minWidth: '80px' }}>id</TableCell>  {/* Reduzido */}
                  <TableCell sx={{ minWidth: '120px' }}>Saída</TableCell>  {/* Reduzido */}
                  
                  <TableCell sx={{ minWidth: '120x' }}>Retorno</TableCell>
                  <TableCell sx={{ minWidth: '80px' }}>Tempo Fala</TableCell>
                  <TableCell sx={{ minWidth: '80px' }}>Tempo Fora</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participante.saidas.map((saida: Saida, index: number) => (
                  <TableRow
                    key={saida.sequencia}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f5f9ff',
                      '&:hover': {
                        backgroundColor: '#ebf2ff'
                      }
                    }}
                  >
                    <TableCell>{saida.id}</TableCell>
                    <TableCell>{saida.tempoDeFala?formatTimeFromMilliseconds(saida.horarioDeSaida):'--'}</TableCell>
                    <TableCell>{saida.tempoDeFala?formatTimeFromMilliseconds(saida.horarioDeRetorno):'--'}</TableCell>
                    <TableCell>
                      {saida.tempoDeFala?formatTimeFromMilliseconds(saida.tempoDeFala):'--'}
                    </TableCell>
                    <TableCell>
                      {saida.horarioDeRetorno
                        ? calcularTempoFora(saida.horarioDeSaida, saida.horarioDeRetorno)
                        : "--"
                      }
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      }
      arrow
      placement="top"
      componentsProps={{
        tooltip: {
          sx: {
            maxWidth: 'none'
          }
        }
      }}
    >
      {children}
    </Tooltip>
  );
};

export default CustomTooltipWithTable;