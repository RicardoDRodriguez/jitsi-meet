function checkJitsiAPI() {
    if (window.JitsiMeetJS && window.JitsiMeetJS.init) {
        // Se a API estiver pronta, executa o código
        initJitsiBlocking();
    } else {
        // Tenta novamente após 1 segundo
        setTimeout(checkJitsiAPI, 1000);
    }
}

function initJitsiBlocking() {
    window.JitsiMeetJS.init({
        disableAudioLevels: true,
    }).then(() => {
        const connection = new JitsiMeetJS.JitsiConnection(
            null,
            null,
            { serviceUrl: 'wss://ricardo.jitsi.participameet.com/xmpp-websocket' }
        );

        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            () => {
                const room = connection.initJitsiConference(
                    window.location.pathname.split('/').pop(),
                    { startAudioMuted: false, startVideoMuted: false }
                );

                room.on(
                    window.JitsiMeetJS.events.conference.PARTICIPANT_JOINED,
                    (participant) => {
                        const participants = room.getParticipants();
                        const currentName = participant.getDisplayName();

                        if (participants.some(p => p.getDisplayName() === currentName)) {
                            room.kickParticipant(participant.getId());
                            console.warn(`Usuário "${currentName}" expulso (nome duplicado)`);
                            try {
                                window.alert(`O nome "${currentName}" já está em uso!`);
                            } catch (e) {}
                        }
                    }
                );

                room.join();
            }
        );

        connection.connect();
    }).catch(error => {
        console.error("Falha ao inicializar Jitsi:", error);
    });
}

// Inicia a verificação
checkJitsiAPI();