// Verifica se a API do Jitsi está disponível
if (window.JitsiMeetJS && window.JitsiMeetJS.init) {
    window.JitsiMeetJS.init({
        disableAudioLevels: true, // Opcional: melhora performance
    }).then(() => {
        const connection = new JitsiMeetJS.JitsiConnection(
            null, // App ID (opcional)
            null, // Token JWT (opcional)
            {
                serviceUrl: 'wss://ricardo.jitsi.participameet.com/xmpp-websocket', // Substitua pelo seu servidor
            }
        );

        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            () => {
                const room = connection.initJitsiConference(
                    window.location.pathname.split('/').pop(), // Pega o nome da sala da URL
                    {
                        startAudioMuted: false,
                        startVideoMuted: false,
                    }
                );

                // Evento disparado quando um participante entra
                room.on(
                    window.JitsiMeetJS.events.conference.PARTICIPANT_JOINED,
                    (participant) => {
                        const participants = room.getParticipants();
                        const currentName = participant.getDisplayName();

                        // Verifica se o nome já está em uso
                        const nameExists = participants.some(
                            (p) => p.getDisplayName() === currentName
                        );

                        if (nameExists) {
                            // Expulsa o usuário com nome duplicado
                            room.kickParticipant(participant.getId());
                            console.warn(`Usuário "${currentName}" já está na sala (nome duplicado)`);
                            
                            // Opcional: Exibe alerta (pode não funcionar em todos os casos)
                            try {
                                window.alert(`O nome "${currentName}" já está em uso! Tente outro nome`);
                            } catch (e) {}
                        }
                    }
                );

                room.join();
            }
        );

        connection.connect();
    }).catch((error) => {
        console.error("Falha ao inicializar Jitsi:", error);
    });
} else {
    console.error("API do Jitsi Meet não encontrada!");
}