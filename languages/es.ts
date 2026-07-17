const lang: Record<string, any> = {
    meta: {
        name: "Español",
        code: "es"
    },
    help: {
        command: {
            name: "help",
            description: "Obtén información sobre el bot y sus comandos",
            category: {
                name: "category",
                description: "Selecciona una categoría para ver",
                choices: {
                    main: "🏠 Menú Principal",
                    music: "🎵 Comandos de Música",
                    playlist: "📋 Comandos de Lista de Reproducción",
                    basic: "💜 Comandos Básicos",
                    utility: "🔧 Comandos de Utilidad"
                }
            }
        },
        categories: {
            main: {
                name: "Menú Principal",
                emoji: "🏠",
                description: "Bienvenido al menú de ayuda"
            },
            music: {
                name: "Comandos de Música",
                emoji: "🎵",
                description: "Controla la reproducción de música y configuraciones"
            },
            playlist: {
                name: "Comandos de Lista de Reproducción",
                emoji: "📋",
                description: "Administra tus listas de reproducción"
            },
            basic: {
                name: "Comandos Básicos",
                emoji: "⚙️",
                description: "Información general del bot y utilidades"
            },
            utility: {
                name: "Comandos de Utilidad",
                emoji: "🔧",
                description: "Funciones de utilidad adicionales"
            }
        },
        mainMenu: {
            header: {
                title: "# 🎵 {botName} Menú de Ayuda",
                welcome: "**¡Bienvenido a {botName}!**",
                subtitle: "Tu compañero musical definitivo en Discord."
            },
            statistics: {
                title: "## Estadísticas",
                commands: "• **Comandos:** {totalCommands}",
                servers: "• **Servidores:** {totalServers}",
                users: "• **Usuarios:** {totalUsers}",
                uptime: "• **Tiempo activo:** {uptimeString}",
                ping: "• **Ping:** {ping}ms"
            },
            categories: {
                title: "## 📂 Categorías Disponibles",
                music: "{emoji} **{name}** - {count} comandos",
                playlist: "{emoji} **{name}** - {count} comandos",
                basic: "{emoji} **{name}** - {count} comandos",
                utility: "{emoji} **{name}** - {count} comandos",
                footer: "**Selecciona una categoría a continuación para ver los comandos detallados.**"
            },
            footer: { version: "**{botName}**", developer: "" },
            selectMenu: {
                placeholder: "📂 Selecciona una categoría para ver los comandos...",
                musicDescription: "{count} comandos disponibles",
                playlistDescription: "{count} comandos disponibles",
                basicDescription: "{count} comandos disponibles",
                utilityDescription: "{count} comandos disponibles"
            },
            buttons: {
                supportServer: "Servidor de Soporte",
                github: "GitHub"
            }
        },
        categoryPage: {
            noCommands: {
                title: "## ❌ No se Encontraron Comandos",
                message: "No hay comandos disponibles en la categoría **{categoryName}**.",
                backToHelp: "Usa `/help` para volver al menú principal."
            },
            header: {
                title: "# {emoji} {categoryName}",
                description: "{description}",
                count: "**{count}** comando{plural} disponible{plural}"
            },
            commands: {
                title: "## Comandos",
                titlePaginated: "## Comandos (Página {currentPage}/{totalPages})",
                item: "**{num}.** `/{commandName}`\n   {description}",
                noDescription: "No hay descripción disponible."
            },
            footer: { version: "**{botName}**", developer: "" },
            buttons: {
                backToMain: "🏠 Volver al Menú Principal",
                supportServer: "Servidor de Soporte",
                github: "GitHub"
            }
        },
        errors: {
            general: "❌ **Ocurrió un error al obtener el menú de ayuda.**",
            fallback: "❌ Ocurrió un error al obtener el menú de ayuda.",
            fallbackDetails: "**Bot:** {botName}\n**Comandos:** {totalCommands}\n**Servidores:** {totalServers}\n**Soporte:** {supportServer}"
        }
    },
    language: {
        command: {
            name: "language",
            description: "Establece el idioma del bot para este servidor",
            option: {
                name: "lang",
                description: "Selecciona un idioma"
            }
        },
        current: {
            title: "🌐 Idioma Actual",
            description: "El idioma actual para este servidor es: **{language}**",
            global: "Predeterminado global (desde la configuración): **{language}**"
        },
        changed: {
            title: "✅ Idioma Cambiado",
            description: "El idioma del servidor ha sido cambiado a: **{language}**",
            note: "El bot ahora usará este idioma para todos los comandos en este servidor."
        },
        available: {
            title: "📚 Idiomas Disponibles",
            description: "Selecciona un idioma de la lista a continuación:",
            list: "**Idiomas Disponibles:**\n{list}",
            item: "• **{name}** (`{code}`)"
        },
        errors: {
            notFound: "❌ **¡Idioma no encontrado!**\nEl idioma `{code}` no existe.",
            failed: "❌ **¡Error al establecer el idioma!**\n{error}",
            noPermission: "❌ **¡No tienes permiso para cambiar el idioma!**\nNecesitas el permiso `Administrar Servidor`."
        },
        info: {
            title: "ℹ️ Información de Idioma",
            description: "**Idioma Actual del Servidor:** {serverLang}\n**Idioma Predeterminado Global:** {globalLang}\n\n**Idiomas Disponibles:** {count}",
            reset: "Para restablecer al predeterminado global, usa `/language reset`"
        }
    },
    ping: {
        command: {
            name: "ping",
            description: "Verifica la latencia y tiempo de respuesta del bot"
        },
        header: {
            title: "# Latencia del Bot",
            botName: "**{botName}** - Bot de Música Lyra",
            subtitle: "Verifica el tiempo de respuesta y estado de conexión del bot"
        },
        metrics: {
            title: "## Métricas de Rendimiento",
            responseTime: "**Tiempo de Respuesta:** {latency}ms",
            websocketPing: "**Ping del Websocket:** {ping}ms",
            botUptime: "**Tiempo Activo del Bot:** {uptime}",
            connectionSpeed: {
                excellent: "🟢 Velocidad de conexión excelente",
                good: "🟡 Buena velocidad de conexión",
                slow: "🔴 Velocidad de conexión lenta"
            }
        },
        footer: { version: "**{botName}**", developer: "" },
        errors: {
            title: "## ❌ Error",
            message: "Ocurrió un error al verificar la latencia.\nPor favor, inténtalo de nuevo más tarde.",
            fallback: "❌ Ocurrió un error al verificar la latencia."
        }
    },
    stats: {
        command: {
            name: "stats",
            description: "Muestra estadísticas del bot e información del servidor"
        },
        header: {
            title: "# Estadísticas del Bot",
            botName: "**{botName}** - Bot de Música Lyra",
            developer: ""
        },
        botInfo: {
            title: "## Información del Bot",
            servers: "• **Servidores:** {count}",
            users: "• **Usuarios:** {count}",
            channels: "• **Canales:** {count}",
            uptime: "• **Tiempo activo:** {uptime}"
        },
        musicStats: {
            title: "## Estadísticas de Música",
            activePlayers: "• **Reproductores Activos:** {count}",
            totalPlayers: "• **Reproductores Totales:** {count}",
            currentTrack: "• **Pista Actual:** {track}"
        },
        systemInfo: {
            title: "## Información del Sistema",
            cpu: "• **CPU:** {cpu}",
            platform: "• **Plataforma:** {platform}",
            nodejs: "• **Node.js:** {version}",
            discordjs: "• **Discord.js:** {version}"
        },
        memory: {
            title: "## Memoria y Rendimiento",
            memoryUsage: "**Uso de Memoria:**",
            used: "• Usado: {used}",
            total: "• Total: {total}",
            systemMemory: "**Memoria del Sistema:**",
            systemUsed: "• Usado: {used}",
            systemFree: "• Libre: {free}",
            performance: "**Rendimiento:**",
            ping: "• Ping: {ping}ms",
            shards: "• Fragmentos: {count}",
            commands: "• Comandos: {count}"
        },
        footer: { version: "**{botName}**", developer: "" },
        errors: {
            title: "## ❌ Error",
            message: "Ocurrió un error al obtener las estadísticas.\nPor favor, inténtalo de nuevo más tarde.",
            fallback: "❌ Ocurrió un error al obtener las estadísticas."
        }
    },
    support: {
        command: {
            name: "support",
            description: "Obtén el enlace del servidor de soporte y enlaces importantes"
        },
        header: {
            title: "# Soporte y Enlaces",
            botName: "**{botName}** - Bot de Música Lyra",
            subtitle: "¡Obtén ayuda, reporta problemas o conéctate con nosotros!"
        },
        links: {
            title: "## Enlaces Importantes",
            supportServer: {
                title: "**Servidor de Soporte**",
                description: "¡Únete a nuestro servidor de Discord para ayuda, actualizaciones y comunidad!",
                link: "[Haz clic aquí para unirte]({url})"
            },
            github: {
                title: "**GitHub**",
                description: "¡Revisa nuestro código y contribuye!",
                link: "[Visitar GitHub]({url})"
            },
            youtube: {
                title: "**YouTube**",
                description: "¡Mira tutoriales y actualizaciones!",
                link: "[Suscribirse]({url})"
            },
            website: {
                title: "**Sitio Web**",
                description: "¡Visita nuestro sitio web oficial!",
                link: "[Visitar Sitio Web]({url})"
            }
        },
        footer: { version: "**{botName}**", developer: "" },
        buttons: {
            supportServer: "Servidor de Soporte",
            github: "GitHub",
            youtube: "YouTube"
        },
        errors: {
            title: "## ❌ Error",
            message: "Ocurrió un error al obtener información de soporte.\nPor favor, inténtalo de nuevo más tarde.",
            fallback: "❌ Ocurrió un error al obtener información de soporte."
        }
    },
    music: {
        autoplay: {
            command: {
                name: "autoplay",
                description: "Activa o desactiva la reproducción automática para el servidor"
            },
            enabled: {
                title: "## ✅ Reproducción Automática Activada",
                message: "La reproducción automática ha sido **activada** para este servidor.",
                note: "🎵 El bot reproducirá automáticamente canciones similares cuando termine la cola."
            },
            disabled: {
                title: "## ❌ Reproducción Automática Desactivada",
                message: "La reproducción automática ha sido **desactivada** para este servidor.",
                note: "⏹️ El bot dejará de reproducir cuando termine la cola."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al actualizar la configuración de reproducción automática.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        pause: {
            command: {
                name: "pause",
                description: "Pausa la canción actual"
            },
            success: {
                title: "## ⏸️ Música Pausada",
                message: "La pista actual ha sido pausada.",
                note: "Usa `/resume` para continuar reproduciendo."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al pausar la música.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        resume: {
            command: {
                name: "resume",
                description: "Reanuda la canción actual"
            },
            success: {
                title: "## ▶️ Música Reanudada",
                message: "La pista actual ha sido reanudada.",
                note: "La música se está reproduciendo ahora."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al reanudar la música.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        skip: {
            command: {
                name: "skip",
                description: "Salta la canción actual"
            },
            success: {
                title: "## ⏭️ Canción Saltada",
                message: "La pista actual ha sido saltada.",
                nextSong: "Reproduciendo la siguiente canción en la cola...",
                queueEmpty: "La cola está vacía."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al saltar la canción.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        previous: {
            command: {
                name: "previous",
                description: "Reproducir la canción anterior nuevamente"
            },
            noPrevious: {
                title: "## ❌ Sin Canción Anterior",
                message: "No hay una canción anterior para reproducir.",
                note: "Reproduce algunas canciones primero para construir un historial."
            },
            success: {
                title: "## ⏮️ Reproduciendo Canción Anterior",
                message: "Ahora reproduciendo la canción anterior"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al reproducir la canción anterior.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        clear: {
            command: {
                name: "clear",
                description: "Limpiar toda la cola"
            },
            success: {
                title: "## 🗑️ Cola Limpiada",
                message: "Se eliminaron exitosamente **{count}** canción{plural} de la cola.",
                note: "La canción actual seguirá reproduciéndose."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al limpiar la cola.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        stop: {
            command: {
                name: "stop",
                description: "Detiene la canción actual y destruye el reproductor"
            },
            success: {
                title: "## ⏹️ Música Detenida",
                message24_7: "Música detenida. Reproductor mantenido activo (modo 24/7 activado).",
                messageNormal: "La música ha sido detenida y el reproductor ha sido destruido.",
                note: "Usa `/play` para comenzar a reproducir música de nuevo."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al detener la música.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        volume: {
            command: {
                name: "volume",
                description: "Establece el volumen de la canción actual"
            },
            invalid: {
                title: "## ❌ Volumen Inválido",
                message: "El volumen debe estar entre **0** y **100**.",
                note: "Por favor, proporciona un nivel de volumen válido."
            },
            success: {
                title: "## 🔊 Volumen Actualizado",
                message: "El volumen ha sido establecido a **{volume}%**.",
                muted: "🔇 Silenciado",
                low: "🔉 Bajo",
                medium: "🔊 Medio",
                high: "🔊🔊 Alto"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al establecer el volumen.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        shuffle: {
            command: {
                name: "shuffle",
                description: "Mezcla la cola de canciones actual"
            },
            queueEmpty: {
                title: "## ❌ Cola Vacía",
                message: "La cola está vacía. No hay canciones para mezclar.",
                note: "Agrega algunas canciones a la cola primero usando `/play`."
            },
            success: {
                title: "## 🔀 Cola Mezclada",
                message: "¡La cola ha sido mezclada exitosamente!",
                count: "**{count}** canción{plural} ha{plural} sido reorganizada{plural}."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al mezclar la cola.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        np: {
            command: {
                name: "np",
                description: "Muestra la canción que se está reproduciendo actualmente con una barra de progreso"
            },
            title: "## Reproduciendo Ahora",
            nowPlaying: "**[{title}]({uri})**",
            by: "por **{author}**",
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al obtener la pista actual.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        queue: {
            command: {
                name: "queue",
                description: "Muestra la cola de canciones actual"
            },
            title: "## 📋 Cola Actual",
            titlePaginated: "## 📋 Cola Actual (Página {currentPage}/{totalPages})",
            nowPlaying: "🎵 **Reproduciendo Ahora:**",
            track: "[{title}]({uri})",
            requestedBy: "Solicitado por: {requester}",
            trackNumber: "**{number}.**",
            noMoreSongs: "No hay más canciones",
            buttons: {
                previous: "Anterior",
                next: "Siguiente"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al obtener la cola.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        remove: {
            command: {
                name: "remove",
                description: "Elimina una canción de la cola por su posición"
            },
            queueEmpty: {
                title: "## ❌ Cola Vacía",
                message: "La cola está vacía. No hay canciones para eliminar.",
                note: "Agrega algunas canciones a la cola primero usando `/play`."
            },
            invalidPosition: {
                title: "## ❌ Posición Inválida",
                message: "La posición debe estar entre **1** y **{max}**.",
                note: "La cola tiene **{count}** canción{plural}."
            },
            success: {
                title: "## ✅ Canción Eliminada",
                removed: "**Eliminada:** [{title}]({uri})",
                position: "**Posición:** {position}",
                message: "La canción ha sido eliminada de la cola."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al eliminar la canción.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        move: {
            command: {
                name: "move",
                description: "Mueve una pista a una posición diferente en la cola"
            },
            queueEmpty: {
                title: "## ❌ Cola Vacía",
                message: "La cola está vacía. No hay canciones para mover.",
                note: "Agrega algunas canciones a la cola primero usando `/play`."
            },
            invalidPosition: {
                title: "## ❌ Posición Inválida",
                message: "La posición debe estar entre **1** y **{max}**.",
                note: "La cola tiene **{count}** canción{plural}."
            },
            samePosition: {
                title: "## ❌ Misma Posición",
                message: "Las posiciones de origen y destino no pueden ser las mismas.",
                note: "Por favor, proporciona posiciones diferentes."
            },
            success: {
                title: "## ✅ Pista Movida",
                track: "**Pista:** [{title}]({uri})",
                from: "**Desde la posición:** {from}",
                to: "**A la posición:** {to}",
                message: "La pista ha sido movida exitosamente."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al mover la pista.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        jump: {
            command: {
                name: "jump",
                description: "Salta a una pista específica en la cola"
            },
            queueEmpty: {
                title: "## ❌ Cola Vacía",
                message: "La cola está vacía. No hay canciones a las que saltar.",
                note: "Agrega algunas canciones a la cola primero usando `/play`."
            },
            invalidPosition: {
                title: "## ❌ Posición Inválida",
                message: "La posición debe estar entre **1** y **{max}**.",
                note: "La cola tiene **{count}** canción{plural}."
            },
            success: {
                title: "## ⏭️ Saltado a la Pista",
                track: "**Pista:** [{title}]({uri})",
                position: "**Posición:** {position}",
                message: "Saltado a la pista especificada en la cola."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al saltar a la pista.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        seek: {
            command: {
                name: "seek",
                description: "Busca un tiempo específico en la pista actual"
            },
            invalidTime: {
                title: "## ❌ Tiempo Inválido",
                message: "Formato de tiempo inválido. Usa uno de los siguientes:",
                formats: "• **MM:SS** (ej., 1:30)\n• **HH:MM:SS** (ej., 1:05:30)\n• **Segundos** (ej., 90)",
                trackLength: "**Duración de la pista:** {length}"
            },
            success: {
                title: "## ⏩ Búsqueda en la Posición",
                time: "**Tiempo:** {time}",
                track: "**Pista:** [{title}]({uri})",
                message: "La pista ha sido buscada al tiempo especificado."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al buscar.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        trackinfo: {
            command: {
                name: "trackinfo",
                description: "Muestra información detallada sobre la pista actual"
            },
            trackInfo: {
                title: "## Información de la Pista",
                titleLabel: "**Título:** [{title}]({uri})",
                artist: "**Artista:** {artist}",
                duration: "**Duración:** {duration}",
                source: "**Fuente:** {source}"
            },
            progress: {
                title: "## Progreso",
                current: "**Actual:** {current}",
                total: "**Total:** {total}",
                progress: "**Progreso:** {progress}%"
            },
            status: {
                title: "## 🎚️ Estado del Reproductor",
                volume: "**Volumen:** {volume}%",
                loop: "**Bucle:** {loop}",
                status: "**Estado:** {status}",
                queue: "**Cola:** {count} pista{plural}"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al obtener información de la pista.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        voteskip: {
            command: {
                name: "voteskip",
                description: "Vota para saltar la pista actual"
            },
            alreadyVoted: {
                title: "## ❌ Ya Has Votado",
                message: "Ya has votado para saltar esta pista.",
                votes: "**Votos actuales:** {current}/{required}"
            },
            success: {
                title: "## ✅ Voto Añadido",
                message: "¡Tu voto ha sido añadido!",
                currentVotes: "**Votos actuales:** {current}/{required}",
                required: "**Requerido:** {required} votos para saltar",
                moreNeeded: "Se necesita{plural} {count} voto{plural} más."
            },
            skipped: {
                title: "## ⏭️ Pista Saltada por Votación",
                message: "¡La pista ha sido saltada!",
                votes: "**Votos:** {current}/{required}",
                required: "**Requerido:** {required} votos"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al procesar el voto.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        filters: {
            command: {
                name: "filters",
                description: "Controla los filtros de audio"
            },
            cleared: {
                title: "## ✅ Filtros Eliminados",
                message: "Todos los filtros de audio han sido eliminados.",
                note: "El audio ahora está de vuelta a lo normal."
            },
            invalid: {
                title: "## ❌ Filtro Inválido",
                message: "El filtro seleccionado es inválido.",
                note: "Por favor, selecciona un filtro válido de las opciones."
            },
            success: {
                title: "## 🎛️ Filtro Aplicado",
                filter: "**Filtro:** {filter}",
                message: "El filtro de audio ha sido aplicado exitosamente.",
                note: "Usa `/filters clear` para eliminar todos los filtros."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al aplicar el filtro.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        play: {
            command: {
                name: "play",
                description: "Reproduce una canción desde un nombre o enlace"
            },
            lavalinkManagerError: {
                title: "## ❌ Error del Administrador de Lavalink",
                message: "El administrador del nodo Lavalink no está inicializado.",
                note: "Por favor, contacta al administrador del bot."
            },
            noNodes: {
                title: "## ❌ Sin Nodos de Lavalink",
                message: "No hay nodos de Lavalink disponibles actualmente ({connected}/{total} conectados).",
                note: "El bot está intentando reconectarse. Por favor, inténtalo en un momento."
            },
            spotifyError: {
                title: "## ❌ Error de Spotify",
                message: "Error al obtener datos de Spotify.",
                note: "Por favor, verifica el enlace e inténtalo de nuevo."
            },
            invalidResponse: {
                title: "## ❌ Respuesta Inválida",
                message: "Respuesta inválida de la fuente de música.",
                note: "Por favor, inténtalo de nuevo o usa una consulta diferente."
            },
            noResults: {
                title: "## ❌ Sin Resultados",
                message: "No se encontraron resultados para tu consulta.",
                note: "Intenta un término de búsqueda o enlace diferente."
            },
            success: {
                titleTrack: "## ✅ Pista Añadida",
                titlePlaylist: "## ✅ Lista de Reproducción Añadida",
                trackAdded: "La pista ha sido añadida a la cola.",
                playlistAdded: "**{count}** pistas han sido añadidas a la cola.",
                nowPlaying: "🎵 Reproduciendo ahora...",
                queueReady: "⏸️ Cola lista"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al procesar la solicitud.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        search: {
            command: {
                name: "search",
                description: "Busca una canción y selecciona de los resultados"
            },
            lavalinkManagerError: {
                title: "## ❌ Error del Administrador de Lavalink",
                message: "El administrador del nodo Lavalink no está inicializado.",
                note: "Por favor, contacta al administrador del bot."
            },
            noNodes: {
                title: "## ❌ Sin Nodos de Lavalink",
                message: "No hay nodos de Lavalink disponibles actualmente ({connected}/{total} conectados).",
                note: "El bot está intentando reconectarse. Por favor, inténtalo en un momento."
            },
            noResults: {
                title: "## ❌ Sin Resultados",
                message: "No se encontraron resultados para tu búsqueda.",
                note: "Intenta un término de búsqueda diferente."
            },
            playlistNotSupported: {
                title: "## ❌ Listas de Reproducción No Compatibles",
                message: "Las listas de reproducción no son compatibles en la búsqueda.",
                note: "Usa el comando `/play` para listas de reproducción."
            },
            results: {
                title: "## 🔍 Resultados de Búsqueda",
                query: "**Consulta:** {query}",
                track: "**{number}.** [{title}]({uri})\n   └ {author} • {duration}"
            },
            buttons: {
                cancel: "Cancelar"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al buscar.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        loop: {
            command: {
                name: "loop",
                description: "Establecer el modo de repetición para la cola actual"
            },
            track: {
                title: "## 🔁 Repetición de Canción Activada",
                message: "La canción actual se repetirá indefinidamente.",
                note: "Usa `/loop off` para desactivar la repetición."
            },
            queue: {
                title: "## 🔁 Repetición de Cola Activada",
                message: "Toda la cola se repetirá ahora.",
                note: "Usa `/loop off` para desactivar la repetición."
            },
            off: {
                title: "## ❌ Repetición Desactivada",
                message: "La repetición ha sido desactivada.",
                note: "Las canciones se reproducirán en orden y se detendrán cuando la cola termine."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al establecer el modo de repetición.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        leave: {
            command: {
                name: "leave",
                description: "Hacer que el bot abandone el canal de voz"
            },
            success: {
                title: "## 👋 Canal de Voz Abandonado",
                message: "El bot ha abandonado el canal de voz.",
                note: "Usa `/play` para empezar a reproducir música de nuevo."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al abandonar el canal de voz.\nPor favor, inténtalo de nuevo más tarde."
            }
        }
    },
    playlist: {
        createplaylist: {
            command: {
                name: "createplaylist",
                description: "Crea una nueva lista de reproducción"
            },
            alreadyExists: {
                title: "## ❌ La Lista de Reproducción Ya Existe",
                message: "Ya existe una lista de reproducción con el nombre **\"{name}\"**.",
                note: "Por favor, elige un nombre diferente."
            },
            success: {
                title: "## ✅ Lista de Reproducción Creada",
                message: "¡Tu lista de reproducción **\"{name}\"** ha sido creada exitosamente!",
                visibility: "**Visibilidad:** {visibility}",
                server: "**Servidor:** {server}",
                private: "🔒 Privada",
                public: "🌐 Pública"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al crear la lista de reproducción.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        addsong: {
            command: {
                name: "addsong",
                description: "Añade una canción a una lista de reproducción"
            },
            notFound: {
                title: "## ❌ Lista de Reproducción No Encontrada",
                message: "La lista de reproducción **\"{name}\"** no existe.",
                note: "Por favor, verifica el nombre de la lista de reproducción e inténtalo de nuevo."
            },
            accessDenied: {
                title: "## 🔒 Acceso Denegado",
                message: "No tienes permiso para modificar esta lista de reproducción.",
                note: "Solo el propietario de la lista de reproducción puede añadir canciones."
            },
            success: {
                title: "## ✅ Canción Añadida",
                song: "**Canción:** {song}",
                playlist: "**Lista de Reproducción:** {playlist}",
                message: "¡La canción ha sido añadida exitosamente a tu lista de reproducción!"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al añadir la canción.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        deleteplaylist: {
            command: {
                name: "deleteplaylist",
                description: "Elimina una lista de reproducción"
            },
            notFound: {
                title: "## ❌ Lista de Reproducción No Encontrada",
                message: "La lista de reproducción **\"{name}\"** no existe.",
                note: "Por favor, verifica el nombre de la lista de reproducción e inténtalo de nuevo."
            },
            accessDenied: {
                title: "## 🔒 Acceso Denegado",
                message: "No tienes permiso para eliminar esta lista de reproducción.",
                note: "Solo el propietario de la lista de reproducción puede eliminarla."
            },
            success: {
                title: "## ✅ Lista de Reproducción Eliminada",
                message: "La lista de reproducción **\"{name}\"** ha sido eliminada exitosamente."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al eliminar la lista de reproducción.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        deletesong: {
            command: {
                name: "deletesong",
                description: "Elimina una canción de una lista de reproducción"
            },
            notFound: {
                title: "## ❌ Lista de Reproducción No Encontrada",
                message: "La lista de reproducción **\"{name}\"** no existe.",
                note: "Por favor, verifica el nombre de la lista de reproducción e inténtalo de nuevo."
            },
            success: {
                title: "## ✅ Canción Eliminada",
                song: "**Canción:** {song}",
                playlist: "**Lista de Reproducción:** {playlist}",
                message: "La canción ha sido eliminada exitosamente de tu lista de reproducción."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al eliminar la canción.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        savequeue: {
            command: {
                name: "savequeue",
                description: "Guarda la cola actual como una lista de reproducción"
            },
            queueEmpty: {
                title: "## ❌ Cola Vacía",
                message: "La cola está vacía. No hay nada que guardar.",
                note: "¡Agrega algunas canciones a la cola primero!"
            },
            alreadyExists: {
                title: "## ❌ La Lista de Reproducción Ya Existe",
                message: "Ya existe una lista de reproducción llamada **\"{name}\"**.",
                note: "Por favor, elige un nombre diferente."
            },
            success: {
                title: "## ✅ ¡Cola Guardada!",
                message: "Cola guardada como lista de reproducción **\"{name}\"**",
                tracks: "**Pistas:** {count}"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al guardar la cola.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        myplaylists: {
            command: {
                name: "myplaylists",
                description: "Lista todas las listas de reproducción que has creado"
            },
            noPlaylists: {
                title: "## 📋 No se Encontraron Listas de Reproducción",
                message: "Aún no has creado ninguna lista de reproducción.",
                note: "¡Usa `/createplaylist` para crear tu primera lista de reproducción!"
            },
            title: "## 📂 Tus Listas de Reproducción (Página {currentPage}/{totalPages})",
            playlistItem: "**{number}.** **{name}**\n   • Visibilidad: **{visibility}**\n   • Servidor: {server}\n   • Canciones: **{count}**",
            visibilityPrivate: "🔒 Privada",
            visibilityPublic: "🌐 Pública",
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al obtener tus listas de reproducción.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        allplaylists: {
            command: {
                name: "allplaylists",
                description: "Lista todas las listas de reproducción públicas"
            },
            noPlaylists: {
                title: "## 📋 No se Encontraron Listas de Reproducción Públicas",
                message: "No hay listas de reproducción públicas disponibles.",
                note: "¡Crea una lista de reproducción pública usando `/createplaylist`!"
            },
            title: "## 🌐 Listas de Reproducción Públicas (Página {currentPage}/{totalPages})",
            playlistItem: "**{number}.** **{name}**\n   • Creada por: {creator}\n   • Servidor: {server}\n   • Canciones: **{count}**",
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al obtener las listas de reproducción públicas.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        showsongs: {
            command: {
                name: "showsongs",
                description: "Muestra todas las canciones en una lista de reproducción"
            },
            notFound: {
                title: "## ❌ Lista de Reproducción No Encontrada",
                message: "La lista de reproducción **\"{name}\"** no existe.",
                note: "Por favor, verifica el nombre de la lista de reproducción e inténtalo de nuevo."
            },
            accessDenied: {
                title: "## 🔒 Acceso Denegado",
                message: "No tienes permiso para ver esta lista de reproducción.",
                note: "Esta lista de reproducción es privada y solo el propietario puede verla."
            },
            empty: {
                title: "## 📋 Canciones en \"{name}\"",
                message: "Esta lista de reproducción está vacía. ¡Añade canciones usando `/addsong`!"
            },
            title: "## Canciones en \"{name}\" (Página {currentPage}/{totalPages})",
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al mostrar las canciones de la lista de reproducción.\nPor favor, inténtalo de nuevo más tarde."
            }
        },
        playcustomplaylist: {
            command: {
                name: "playcustomplaylist",
                description: "Reproduce una lista de reproducción personalizada"
            },
            notFound: {
                title: "## ❌ Lista de Reproducción No Encontrada",
                message: "La lista de reproducción **\"{name}\"** no existe.",
                note: "Por favor, verifica el nombre de la lista de reproducción e inténtalo de nuevo."
            },
            accessDenied: {
                title: "## 🔒 Acceso Denegado",
                message: "No tienes permiso para reproducir esta lista de reproducción.",
                note: "Esta lista de reproducción es privada y solo el propietario puede reproducirla."
            },
            empty: {
                title: "## ❌ Lista de Reproducción Vacía",
                message: "La lista de reproducción **\"{name}\"** está vacía.",
                note: "¡Añade algunas canciones a la lista de reproducción primero!"
            },
            lavalinkManagerError: {
                title: "## ❌ Error del Administrador de Lavalink",
                message: "El administrador del nodo Lavalink no está inicializado.",
                note: "Por favor, contacta al administrador del bot."
            },
            noNodes: {
                title: "## ❌ Sin Nodos de Lavalink",
                message: "No hay nodos de Lavalink disponibles actualmente ({connected}/{total} conectados).",
                note: "El bot está intentando reconectarse. Por favor, inténtalo en un momento."
            },
            resolveError: {
                title: "## ❌ Error al Resolver Canción",
                message: "Error al resolver una o más canciones de la lista de reproducción.",
                note: "Por favor, verifica la lista de reproducción e inténtalo de nuevo."
            },
            success: {
                title: "## Reproduciendo Lista de Reproducción",
                message: "Reproduciendo ahora la lista de reproducción **\"{name}\"**",
                songs: "**Canciones:** {count}"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al reproducir la lista de reproducción.\nPor favor, inténtalo de nuevo más tarde."
            }
        }
    },
    utility: {
        twentyfourseven: {
            command: {
                name: "247",
                description: "Activa o desactiva el modo 24/7 (mantiene el bot en el canal de voz)"
            },
            accessDenied: {
                title: "## ❌ Acceso Denegado",
                message: "Solo el propietario del servidor puede activar o desactivar el modo 24/7."
            },
            enabled: {
                title: "## ✅ Modo 24/7 Activado",
                message: "El modo 24/7 ha sido **activado** para este servidor.",
                note: "🔄 El bot permanecerá en el canal de voz incluso cuando la cola esté vacía."
            },
            disabled: {
                title: "## ❌ Modo 24/7 Desactivado",
                message: "El modo 24/7 ha sido **desactivado** para este servidor.",
                note: "⏹️ El bot saldrá del canal de voz cuando termine la cola."
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al actualizar el modo 24/7.",
                note: "Por favor, inténtalo de nuevo más tarde."
            }
        },
        history: {
            command: {
                name: "history",
                description: "Muestra las pistas reproducidas recientemente"
            },
            noHistory: {
                title: "## 📜 No se Encontró Historial",
                message: "No se encontró historial de reproducción para este servidor.",
                note: "¡Reproduce algunas canciones para construir tu historial!"
            },
            title: "## 📜 Historial de Reproducción",
            titlePaginated: "## 📜 Historial de Reproducción (Página {currentPage}/{totalPages})",
            noMoreSongs: "- No hay más canciones en el historial.",
            buttons: {
                previous: "Anterior",
                next: "Siguiente"
            },
            errors: {
                title: "## ❌ Error",
                message: "Ocurrió un error al obtener el historial.",
                note: "Por favor, inténtalo de nuevo más tarde."
            }
        }
    },
    events: {
        interactionCreate: {
            noGuild: "❌ **Este comando solo puede ser usado en un servidor.**",
            commandNotFound: "❌ **¡Comando no encontrado!**",
            noPermission: "❌ **No tienes permiso para usar este comando.**",
            rateLimited: "⏳ **¡Demasiado rápido!**\nEspera **{seconds}** segundo(s) antes de usar otro comando.",
            errorOccurred: "❌ **Ocurrió un error: {message}**",
            unexpectedError: "❌ **Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.**",
            errorTryAgain: "❌ Ocurrió un error. Por favor, inténtalo de nuevo."
        }
    },
    utils: {
        voiceChannelCheck: {
            noVoiceChannel: {
                title: "## ❌ Sin Canal de Voz",
                message: "Necesitas estar en un canal de voz para usar este comando.",
                note: "Por favor, únete a un canal de voz e inténtalo de nuevo."
            },
            wrongChannel: {
                title: "## Únete al Canal de Voz",
                message: "El bot está actualmente activo en **{channelName}**.",
                note: "Por favor, únete a **{channelName}** para usar comandos de música."
            }
        },
        playerValidation: {
            queueEmpty: {
                title: "## ❌ Cola Vacía",
                message: "La cola está vacía. No hay canciones disponibles.",
                note: "Agrega algunas canciones a la cola primero usando `/play`."
            },
            noSongPlaying: {
                title: "## ❌ Ninguna Canción Reproduciendo",
                message: "No se está reproduciendo ninguna canción actualmente.",
                note: "Usa `/play` para comenzar a reproducir música."
            },
            noMusicPlaying: {
                title: "## ❌ Sin Música Reproduciendo",
                message: "No hay música reproduciendo actualmente y la cola está vacía.",
                note: "Usa `/play` para comenzar a reproducir música."
            }
        },
        responseHandler: {
            defaultError: {
                title: "## ❌ Error",
                message: "Ocurrió un error al procesar el comando.",
                note: "Por favor, inténtalo de nuevo más tarde."
            },
            commandError: "❌ Ocurrió un error al procesar el comando {commandName}."
        }
    },
    console: {
        bot: {
            clientLogged: "Cliente conectado como {tag}",
            musicSystemReady: "Sistema de Música Riffy Listo 🎵",
            lavalinkError: "Error al inicializar el reproductor: {message}",
            nodeManagerStatus: "Administrador de Nodos: {available}/{total} nodos disponibles",
            nodeStatus: "Estado del Nodo:",
            nodeInfo: "{icon} {name} ({host}:{port}) - {status}{error}",
            commandsLoaded: "Total de Comandos Cargados: {count}",
            commandLoadFailed: "Error al cargar: {name} - Falta datos o propiedad run",
            commandLoadError: "Error al cargar {name}: {message}",
            tokenVerification: "🔐 VERIFICACIÓN DE TOKEN",
            tokenAuthFailed: "Autenticación Fallida ❌",
            tokenError: "Error: Activa los Intents o Restablece un Nuevo Token",
            databaseOnline: "Base de Datos en Línea ✅",
            databaseStatus: "🕸️  ESTADO DE LA BASE DE DATOS",
            databaseConnection: "🕸️  CONEXIÓN DE BASE DE DATOS",
            databaseFailed: "Conexión Fallida ❌",
            databaseError: "Error: {message}",
            unhandledRejection: "Rechazo No Manejado:",
            uncaughtException: "Excepción No Capturada:",
            riffyThumbnailError: "[ Riffy ] Ignorando error de miniatura: {message}"
        },
        events: {
            rest: {
                commandsRegistered: "Se registraron exitosamente {count} comandos de aplicación (/) globalmente ✅",
                commandsFailed: "Error al registrar comandos ❌",
                error: "Error: {message}",
                details: "Detalles: {details}"
            },
            interaction: {
                commandNotFound: "Comando no encontrado: {commandName}",
                errorExecuting: "Error al ejecutar el comando {commandName}:",
                errorHelpButton: "Error al manejar el botón de retroceso de ayuda:",
                errorHelpSelect: "Error al manejar la selección de categoría de ayuda:",
                unexpectedError: "Error inesperado:",
                failedToSendError: "Error al enviar mensaje de error:"
            }
        },
        database: {
            uriNotDefined: "La URI de la base de datos no está definida en la configuración.",
            skippingConnection: "Omitiendo conexión a la base de datos ya que no se proporcionó la URI.",
            connected: "Conectado a la base de datos ✅",
            connectionFailed: "No se pudo conectar a la base de datos. Continuando sin funcionalidad de base de datos."
        },
        lavalink: {
            nodesConfigured: "Nodos configurados: {count}",
            riffyInitialized: "Inicializado con {count} nodo(s)",
            nodeKeys: "Claves de nodo:",
            failedToInitialize: "Error al inicializar Riffy: {message}",
            riffyReinitialized: "Riffy reinicializado",
            failedToReinitialize: "Error al reinicializar Riffy: {message}",
            nodeConnected: "Conectado: {name} ({host}:{port}) • {available}/{total} activos",
            nodeDisconnected: "Desconectado: {name} ({host}:{port}) • {available}/{total} activos",
            retryLimitReported: "Límite de reintento reportado por {name}; el bucle de reconexión continúa",
            nodeError: "Error: {name} ({host}:{port}) • {message}",
            nodeStatus: "{available}/{total} activos",
            waitingForConnection: "Esperando conexión del nodo Lavalink...",
            nodeAvailable: "Nodo disponible ({count} conectados)",
            noNodesConnected: "No hay nodos conectados ({connected}/{total}) — intentando reconectar...",
            nodeStatusReport: "Estado del Nodo: {connected}/{total} conectados"
        },
        player: {
            lacksPermissions: "El bot carece de los permisos necesarios para enviar mensajes en este canal.",
            errorSendingMessage: "Error al enviar mensaje: {message}",
            trackException: "Excepción de Pista para el servidor {guildId}: {message}",
            trackStuck: "Pista Atascada para el servidor {guildId}: {message}",
            trackNull: "La pista es nula o falta información para el servidor {guildId} - ignorando evento",
            playerInvalid: "Reproductor inválido o destruido para el servidor {guildId} - ignorando evento",
            channelNotFound: "Canal no encontrado para el servidor {guildId}",
            errorSavingHistory: "Error al guardar en el historial:",
            errorMusicCard: "Error al crear o enviar tarjeta de música: {message}",
            autoplayDisabled: "La reproducción automática está desactivada para el servidor: {guildId}",
            errorQueueEnd: "Error al manejar el fin de la cola:",
            errorCleanupPrevious: "Error al limpiar el mensaje de pista anterior:",
            errorCleanupTrack: "Error al limpiar el mensaje de pista:",
            unableToSendMessage: {
                title: "## ⚠️ No se puede enviar el mensaje",
                message: "No se puede enviar el mensaje. Verifica los permisos del bot."
            },
            trackError: {
                title: "## ⚠️ Error de Pista",
                message: "No se pudo cargar la pista.",
                skipping: "Saltando a la siguiente canción..."
            },
            unableToLoadCard: {
                title: "## ⚠️ No se puede cargar la tarjeta de pista",
                message: "No se puede cargar la tarjeta de pista. Continuando la reproducción..."
            },
            queueEnd: {
                noMoreAutoplay: "⚠️ **No hay más pistas para reproducir automáticamente. Desconectando...**",
                queueEndedAutoplayDisabled: "🎶 **La cola ha terminado. La reproducción automática está desactivada.**",
                queueEmpty: "👾 **¡Cola vacía! Desconectando...**",
                twentyfoursevenEmpty: "🔄 **Modo 24/7: El bot permanecerá en el canal de voz. La cola está vacía.**"
            },
            voiceChannelRequired: {
                title: "## 🔒 Canal de Voz Requerido",
                message: "¡Necesitas estar en el mismo canal de voz para usar los controles!"
            },
            controls: {
                skip: "⏭️ **Saltando a la siguiente canción...**",
                queueCleared: "🗑️ **¡La cola ha sido limpiada!**",
                playbackStopped: "⏹️ **¡La reproducción se ha detenido y el reproductor ha sido destruido!**",
                alreadyPaused: "⏸️ **¡La reproducción ya está en pausa!**",
                playbackPaused: "⏸️ **¡La reproducción ha sido pausada!**",
                alreadyResumed: "▶️ **¡La reproducción ya se ha reanudado!**",
                playbackResumed: "▶️ **¡La reproducción se ha reanudado!**",
                volumeMax: "🔊 **¡El volumen ya está al máximo!**",
                volumeMin: "🔉 **¡El volumen ya está al mínimo!**",
                volumeChanged: "🔊 **¡El volumen cambió a {volume}%!**",
                trackLoopActivated: "🔁 **¡El bucle de pista está activado!**",
                queueLoopActivated: "🔁 **¡El bucle de cola está activado!**",
                loopDisabled: "❌ **¡El bucle está desactivado!**"
            },
            trackInfo: {
                title: "**Título:**",
                author: "**Autor:**",
                length: "**Duración:**",
                requester: "**Solicitado por:**",
                source: "**Fuente:**",
                progress: "**Progreso:**",
                unknownArtist: "Artista Desconocido",
                unknown: "Desconocido"
            },
            controlLabels: {
                loop: "Bucle",
                disable: "Desactivar",
                skip: "Saltar",
                queue: "Cola",
                clear: "Limpiar",
                stop: "Detener",
                pause: "Pausar",
                resume: "Reanudar",
                volUp: "Vol +",
                volDown: "Vol -"
            }
        }
    }
};
export default lang;