import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';

import { IReduxState } from '../../../app/types';
import participantsPaneTheme from '../../../base/components/themes/participantsPaneTheme.json';
import { openDialog } from '../../../base/dialog/actions';
import { IconCloseLarge, IconDotsHorizontal } from '../../../base/icons/svg';
import { isLocalParticipantModerator } from '../../../base/participants/functions';
import Button from '../../../base/ui/components/web/Button';
import ClickableIcon from '../../../base/ui/components/web/ClickableIcon';
import { BUTTON_TYPES } from '../../../base/ui/constants.web';
import { findAncestorByClass } from '../../../base/ui/functions.web';
import { isAddBreakoutRoomButtonVisible } from '../../../breakout-rooms/functions';
import MuteEveryoneDialog from '../../../video-menu/components/web/MuteEveryoneDialog';
import { close } from '../../actions.web';
import {
    getParticipantsPaneOpen,
    getSortedParticipantIds,
    isMoreActionsVisible,
    isMuteAllVisible
} from '../../functions';
import { AddBreakoutRoomButton } from '../breakout-rooms/components/web/AddBreakoutRoomButton';
import { RoomList } from '../breakout-rooms/components/web/RoomList';

import { FooterContextMenu } from './FooterContextMenu';
import LobbyParticipants from './LobbyParticipants';
import MeetingParticipants from './MeetingParticipants';
import VisitorsList from './VisitorsList';

/**
 * Pacotes do Participometro
 */
import LiveGaugeChart from '../gaugemeter/LiveGaugeChart';
import AvatarProgress from '../gaugemeter/AvatarProgress';
import { Container } from '@mui/material';     

const useStyles = makeStyles()(theme => {
    return {
        participantsPane: {
            backgroundColor: theme.palette.ui01,
            flexShrink: 0,
            overflow: 'auto',
            position: 'relative',
            transition: 'width .16s ease-in-out',
            width: '315px',
            zIndex: 0,
            display: 'flex',
            flexDirection: 'column',
            fontWeight: 600,
            height: '100%',

            [['& > *:first-child', '& > *:last-child'] as any]: {
                flexShrink: 0
            },

            '@media (max-width: 580px)': {
                height: '100dvh',
                position: 'fixed',
                left: 0,
                right: 0,
                top: 0,
                width: '100%'
            }
        },

        container: {
            boxSizing: 'border-box',
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
            padding: `0 ${participantsPaneTheme.panePadding}px`,

            '&::-webkit-scrollbar': {
                display: 'none'
            }
        },



        closeButton: {
            alignItems: 'center',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center'
        },

        header: {
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            height: '60px',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            justifyContent: 'flex-end'
        },

        headerh3: {
            align: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            height: '40px',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            justifyContent: 'center', // Corrigido para 'center' ao invés de 'flex-center'
            fontSize: '2.17em', // Tamanho de fonte padrão para <h3>
            fontWeight: 'bold', // Peso da fonte padrão para <h3>
            margin: '0px 0px 0px 0px', // Margem padrão para <h3>
            lineHeight: '10.0', // Altura da linha para melhorar a legibilidade
            textAlign: 'center', // Centraliza o texto
            width: '100%', // Garante que o elemento ocupe toda a largura disponível
        },

        headerh5: {
            align: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'flex',
            height: '20px',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            justifyContent: 'center', // Corrigido para 'center' ao invés de 'flex-center'
            fontSize: '1.30em', // Tamanho de fonte padrão para <h5>
            fontWeight: 'bold', // Peso da fonte padrão para <h5>
            margin: '10px 0px 30px 0px', // Margem padrão para <h5>
            lineHeight: '15.0', // Altura da linha para melhorar a legibilidade
            textAlign: 'center', // Centraliza o texto
            width: '100%', // Garante que o elemento ocupe toda a largura disponível
        },


        concentrada: {
            align: 'center',
            position: 'absolute',
            top: '270px',
            left: '24%',
            transform: 'translate(-50%, -50%)',
            color: '#E4080A',
            '& span': {
                color: '#E4080A',
                fontWeight: 'bold'
            }
        },

        moderada: {
            align: 'center',
            position: 'absolute',
            top: '145px',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#7DDA58',
            '& span': {
                color: '#7DDA58',
                fontWeight: 'bold'
            }
        },

        equalitaria: {
            align: 'center',
            position: 'absolute',
            top: '270px',
            left: '76.5%',
            transform: 'translate(-50%, -50%)',
            color: '#5DE2E7',
            '& span': {
                color: '#5DE2E7',
                fontWeight: 'bold'
            }
        },

        antiCollapse: {
            fontSize: 0,

            '&:first-child': {
                display: 'none'
            },

            '&:first-child + *': {
                marginTop: 0
            }
        },

        livegaugechart: {
            boxSizing: 'border-box',
            flex: 1,
            top: '150px',
            width: '100%',
            minHeight: '30vh',
            overflowY: 'auto',
            position: 'absolute',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            margin: '0px',
            '&::-webkit-scrollbar': {
                display: 'none'
            }
        },


        avatarpercent: {
            top: '330px',
            width: '100%',
            boxSizing: 'border-box',
            flex: 0,
            minHeight: '30vh',
            overflowY: 'auto',
            position: 'absolute',
            padding: `0 ${participantsPaneTheme.panePadding}px`,
            '&::-webkit-scrollbar': {
                display: 'none'
            }
        },

        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
            padding: `${theme.spacing(4)} ${participantsPaneTheme.panePadding}px`,

            '& > *:not(:last-child)': {
                marginRight: theme.spacing(3)
            }
        },

        footerMoreContainer: {
            position: 'relative'
        }
    };
});

const ParticipantsPane = () => {
    const { classes, cx } = useStyles();
    const paneOpen = useSelector(getParticipantsPaneOpen);
    const isBreakoutRoomsSupported = useSelector((state: IReduxState) => state['features/base/conference'])
        .conference?.getBreakoutRooms()?.isSupported();

    const showAddRoomButton = useSelector(isAddBreakoutRoomButtonVisible);
    const showFooter = useSelector(isLocalParticipantModerator);
    const showMuteAllButton = useSelector(isMuteAllVisible);
    const showMoreActionsButton = useSelector(isMoreActionsVisible);
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [contextOpen, setContextOpen] = useState(true);
    const [searchString, setSearchString] = useState('');


    const onWindowClickListener = useCallback((e: any) => {
        if (contextOpen && !findAncestorByClass(e.target, classes.footerMoreContainer)) {
            setContextOpen(false);
        }
    }, [contextOpen]);

    useEffect(() => {
        window.addEventListener('click', onWindowClickListener);

        return () => {
            window.removeEventListener('click', onWindowClickListener);
        };
    }, []);

    const onClosePane = useCallback(() => {
        dispatch(close());
    }, []);

    const onDrawerClose = useCallback(() => {
        setContextOpen(false);
    }, []);

    const onMuteAll = useCallback(() => {
        dispatch(openDialog(MuteEveryoneDialog));
    }, []);

    const onToggleContext = useCallback(() => {
        setContextOpen(open => !open);
    }, []);

    /**
     * Se o painel não for aberto retornar null
     * ----------------------------------------
     */
    if (!paneOpen) {
        return null;
    }

    /**
     * GaugeChart e do ProgressBar 
     */
    return (
        <div className={cx('participants_pane', classes.participantsPane)}>

            <div className={classes.header}> &NBSP;
            </div>

            <div className={classes.headerh3}>
                Participômetro
            </div>

            <div className={classes.headerh5}>
                (Distribuição dos Tempos de Fala)
            </div>

            <br className={classes.antiCollapse} />

            <div className={classes.moderada}>
                MODERADA
            </div>

            <br className={classes.antiCollapse} />

            <div className={classes.livegaugechart}>
                <LiveGaugeChart />
            </div>
            
            <br className={classes.antiCollapse} />

            <div className={classes.concentrada}>
                CONCENTRADA
            </div>

            <div className={classes.equalitaria}>
                IGUALITÁRIA
            </div>


            <div className={classes.avatarpercent}>
                <AvatarProgress />
            </div>

        </div>

    );
};


export default ParticipantsPane;
