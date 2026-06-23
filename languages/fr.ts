const lang: Record<string, any> = {
    meta: {
        name: "Français",
        code: "fr"
    },
    help: {
        command: {
            name: "help",
            description: "Obtenir des informations sur le bot et ses commandes",
            category: {
                name: "category",
                description: "Sélectionner une catégorie à afficher",
                choices: {
                    main: "🏠 Menu Principal",
                    music: "🎵 Commandes Musicales",
                    playlist: "📋 Commandes de Playlist",
                    basic: "💜 Commandes de Base",
                    utility: "🔧 Commandes Utilitaires"
                }
            }
        },
        categories: {
            main: {
                name: "Menu Principal",
                emoji: "🏠",
                description: "Bienvenue dans le menu d'aide"
            },
            music: {
                name: "Commandes Musicales",
                emoji: "🎵",
                description: "Contrôler la lecture musicale et les paramètres"
            },
            playlist: {
                name: "Commandes de Playlist",
                emoji: "📋",
                description: "Gérer vos playlists"
            },
            basic: {
                name: "Commandes de Base",
                emoji: "⚙️",
                description: "Informations générales du bot et utilitaires"
            },
            utility: {
                name: "Commandes Utilitaires",
                emoji: "🔧",
                description: "Fonctionnalités utilitaires supplémentaires"
            }
        },
        mainMenu: {
            header: {
                title: "# 🎵 {botName} Menu d'Aide",
                welcome: "**Bienvenue sur {botName} !**",
                subtitle: "Votre compagnon musical ultime sur Discord."
            },
            statistics: {
                title: "## Statistiques",
                commands: "• **Commandes :** {totalCommands}",
                servers: "• **Serveurs :** {totalServers}",
                users: "• **Utilisateurs :** {totalUsers}",
                uptime: "• **Temps de fonctionnement :** {uptimeString}",
                ping: "• **Ping :** {ping}ms"
            },
            categories: {
                title: "## 📂 Catégories Disponibles",
                music: "{emoji} **{name}** - {count} commandes",
                playlist: "{emoji} **{name}** - {count} commandes",
                basic: "{emoji} **{name}** - {count} commandes",
                utility: "{emoji} **{name}** - {count} commandes",
                footer: "**Sélectionnez une catégorie ci-dessous pour voir les commandes détaillées.**"
            },
            footer: { version: "**{botName}**", developer: "" },
            selectMenu: {
                placeholder: "📂 Sélectionner une catégorie pour voir les commandes...",
                musicDescription: "{count} commandes disponibles",
                playlistDescription: "{count} commandes disponibles",
                basicDescription: "{count} commandes disponibles",
                utilityDescription: "{count} commandes disponibles"
            },
            buttons: {
                supportServer: "Serveur de Support",
                github: "GitHub"
            }
        },
        categoryPage: {
            noCommands: {
                title: "## ❌ Aucune Commande Trouvée",
                message: "Aucune commande disponible dans la catégorie **{categoryName}**.",
                backToHelp: "Utilisez `/help` pour revenir au menu principal."
            },
            header: {
                title: "# {emoji} {categoryName}",
                description: "{description}",
                count: "**{count}** commande{plural} disponible{plural}"
            },
            commands: {
                title: "## Commandes",
                titlePaginated: "## Commandes (Page {currentPage}/{totalPages})",
                item: "**{num}.** `/{commandName}`\\n   {description}",
                noDescription: "Aucune description disponible."
            },
            footer: { version: "**{botName}**", developer: "" },
            buttons: {
                backToMain: "🏠 Retour au Menu Principal",
                supportServer: "Serveur de Support",
                github: "GitHub"
            }
        },
        errors: {
            general: "❌ **Une erreur s'est produite lors de la récupération du menu d'aide.**",
            fallback: "❌ Une erreur s'est produite lors de la récupération du menu d'aide.",
            fallbackDetails: "**Bot :** {botName}\\n**Commandes :** {totalCommands}\\n**Serveurs :** {totalServers}\\n**Support :** {supportServer}"
        }
    },
    language: {
        command: {
            name: "language",
            description: "Définir la langue du bot pour ce serveur",
            option: {
                name: "lang",
                description: "Sélectionner une langue"
            }
        },
        current: {
            title: "🌐 Langue Actuelle",
            description: "La langue actuelle pour ce serveur est : **{language}**",
            global: "Par défaut global (depuis la configuration) : **{language}**"
        },
        changed: {
            title: "✅ Langue Modifiée",
            description: "La langue du serveur a été changée en : **{language}**",
            note: "Le bot utilisera désormais cette langue pour toutes les commandes sur ce serveur."
        },
        available: {
            title: "📚 Langues Disponibles",
            description: "Sélectionnez une langue dans la liste ci-dessous :",
            list: "**Langues Disponibles :**\\n{list}",
            item: "• **{name}** (`{code}`)"
        },
        errors: {
            notFound: "❌ **Langue non trouvée !**\\nLa langue `{code}` n'existe pas.",
            failed: "❌ **Échec de la définition de la langue !**\\n{error}",
            noPermission: "❌ **Vous n'avez pas la permission de changer la langue !**\\nVous avez besoin de la permission `Gérer le serveur`."
        },
        info: {
            title: "ℹ️ Information sur la Langue",
            description: "**Langue Actuelle du Serveur :** {serverLang}\\n**Langue par Défaut Globale :** {globalLang}\\n\\n**Langues Disponibles :** {count}",
            reset: "Pour réinitialiser au défaut global, utilisez `/language reset`"
        }
    },
    ping: {
        command: {
            name: "ping",
            description: "Vérifier la latence et le temps de réponse du bot"
        },
        header: {
            title: "# Latence du Bot",
            botName: "**{botName}** - Bot Musical Lyra",
            subtitle: "Vérifiez le temps de réponse et l'état de connexion du bot"
        },
        metrics: {
            title: "## Métriques de Performance",
            responseTime: "**Temps de Réponse :** {latency}ms",
            websocketPing: "**Ping Websocket :** {ping}ms",
            botUptime: "**Temps de Fonctionnement :** {uptime}",
            connectionSpeed: {
                excellent: "🟢 Excellente vitesse de connexion",
                good: "🟡 Bonne vitesse de connexion",
                slow: "🔴 Vitesse de connexion lente"
            }
        },
        footer: { version: "**{botName}**", developer: "" },
        errors: {
            title: "## ❌ Erreur",
            message: "Une erreur s'est produite lors de la vérification de la latence.\\nVeuillez réessayer plus tard.",
            fallback: "❌ Une erreur s'est produite lors de la vérification de la latence."
        }
    },
    stats: {
        command: {
            name: "stats",
            description: "Afficher les statistiques du bot et les informations du serveur"
        },
        header: {
            title: "# Statistiques du Bot",
            botName: "**{botName}** - Bot Musical Lyra",
            developer: "Développé par ShadowBlack / https://github.com/Shadow-Black-YT"
        },
        botInfo: {
            title: "## Informations du Bot",
            servers: "• **Serveurs :** {count}",
            users: "• **Utilisateurs :** {count}",
            channels: "• **Canaux :** {count}",
            uptime: "• **Temps de fonctionnement :** {uptime}"
        },
        musicStats: {
            title: "## Statistiques Musicales",
            activePlayers: "• **Lecteurs Actifs :** {count}",
            totalPlayers: "• **Total de Lecteurs :** {count}",
            currentTrack: "• **Piste Actuelle :** {track}"
        },
        systemInfo: {
            title: "## Informations Système",
            cpu: "• **CPU :** {cpu}",
            platform: "• **Plateforme :** {platform}",
            nodejs: "• **Node.js :** {version}",
            discordjs: "• **Discord.js :** {version}"
        },
        memory: {
            title: "## Mémoire et Performance",
            memoryUsage: "**Utilisation de la Mémoire :**",
            used: "• Utilisée : {used}",
            total: "• Total : {total}",
            systemMemory: "**Mémoire Système :**",
            systemUsed: "• Utilisée : {used}",
            systemFree: "• Libre : {free}",
            performance: "**Performance :**",
            ping: "• Ping : {ping}ms",
            shards: "• Shards : {count}",
            commands: "• Commandes : {count}"
        },
        footer: { version: "**{botName}**", developer: "" },
        errors: {
            title: "## ❌ Erreur",
            message: "Une erreur s'est produite lors de la récupération des statistiques.\\nVeuillez réessayer plus tard.",
            fallback: "❌ Une erreur s'est produite lors de la récupération des statistiques."
        }
    },
    support: {
        command: {
            name: "support",
            description: "Obtenir le lien du serveur de support et les liens importants"
        },
        header: {
            title: "# Support et Liens",
            botName: "**{botName}** - Bot Musical Lyra",
            subtitle: "Obtenez de l'aide, signalez des problèmes ou connectez-vous avec nous !"
        },
        links: {
            title: "## Liens Importants",
            supportServer: {
                title: "**Serveur de Support**",
                description: "Rejoignez notre serveur Discord pour l'aide, les mises à jour et la communauté !",
                link: "[Cliquez ici pour rejoindre]({url})"
            },
            github: {
                title: "**GitHub**",
                description: "Consultez notre code et contribuez !",
                link: "[Visiter GitHub]({url})"
            },
            youtube: {
                title: "**YouTube**",
                description: "Regardez les tutoriels et les mises à jour !",
                link: "[S'abonner]({url})"
            },
            website: {
                title: "**Site Web**",
                description: "Visitez notre site web officiel !",
                link: "[Visiter le Site Web]({url})"
            }
        },
        footer: { version: "**{botName}**", developer: "" },
        buttons: {
            supportServer: "Serveur de Support",
            github: "GitHub",
            youtube: "YouTube"
        },
        errors: {
            title: "## ❌ Erreur",
            message: "Une erreur s'est produite lors de la récupération des informations de support.\\nVeuillez réessayer plus tard.",
            fallback: "❌ Une erreur s'est produite lors de la récupération des informations de support."
        }
    },
    music: {
        autoplay: {
            command: {
                name: "autoplay",
                description: "Activer/désactiver la lecture automatique pour le serveur"
            },
            enabled: {
                title: "## ✅ Lecture Automatique Activée",
                message: "La lecture automatique a été **activée** pour ce serveur.",
                note: "🎵 Le bot jouera automatiquement des chansons similaires lorsque la file d'attente se terminera."
            },
            disabled: {
                title: "## ❌ Lecture Automatique Désactivée",
                message: "La lecture automatique a été **désactivée** pour ce serveur.",
                note: "⏹️ Le bot arrêtera la lecture lorsque la file d'attente se terminera."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la mise à jour des paramètres de lecture automatique.\\nVeuillez réessayer plus tard."
            }
        },
        pause: {
            command: {
                name: "pause",
                description: "Mettre en pause la chanson actuelle"
            },
            success: {
                title: "## ⏸️ Musique en Pause",
                message: "La piste actuelle a été mise en pause.",
                note: "Utilisez `/resume` pour continuer la lecture."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la mise en pause de la musique.\\nVeuillez réessayer plus tard."
            }
        },
        resume: {
            command: {
                name: "resume",
                description: "Reprendre la chanson actuelle"
            },
            success: {
                title: "## ▶️ Musique Reprise",
                message: "La piste actuelle a été reprise.",
                note: "La musique est maintenant en cours de lecture."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la reprise de la musique.\\nVeuillez réessayer plus tard."
            }
        },
        skip: {
            command: {
                name: "skip",
                description: "Passer la chanson actuelle"
            },
            success: {
                title: "## ⏭️ Chanson Passée",
                message: "La piste actuelle a été passée.",
                nextSong: "Lecture de la prochaine chanson dans la file d'attente...",
                queueEmpty: "La file d'attente est vide."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du passage de la chanson.\\nVeuillez réessayer plus tard."
            }
        },
        previous: {
            command: {
                name: "previous",
                description: "Rejouer le morceau précédent"
            },
            noPrevious: {
                title: "## ❌ Aucun Morceau Précédent",
                message: "Il n'y a aucun morceau précédent à jouer.",
                note: "Joue d'abord quelques morceaux pour créer un historique."
            },
            success: {
                title: "## ⏮️ Morceau Précédent",
                message: "Lecture du morceau précédent"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur est survenue lors de la lecture du morceau précédent.\nVeuillez réessayer plus tard."
            }
        },
        clear: {
            command: {
                name: "clear",
                description: "Vider toute la file d'attente"
            },
            success: {
                title: "## 🗑️ File d'Attente Vidée",
                message: "**{count}** chanson{plural} supprimée{plural} avec succès de la file d'attente.",
                note: "La chanson en cours continuera de jouer."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du vidage de la file d'attente.\\nVeuillez réessayer plus tard."
            }
        },
        stop: {
            command: {
                name: "stop",
                description: "Arrêter la chanson actuelle et détruire le lecteur"
            },
            success: {
                title: "## ⏹️ Musique Arrêtée",
                message24_7: "Musique arrêtée. Lecteur maintenu actif (mode 24/7 activé).",
                messageNormal: "La musique a été arrêtée et le lecteur a été détruit.",
                note: "Utilisez `/play` pour recommencer à jouer de la musique."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de l'arrêt de la musique.\\nVeuillez réessayer plus tard."
            }
        },
        volume: {
            command: {
                name: "volume",
                description: "Définir le volume de la chanson actuelle"
            },
            invalid: {
                title: "## ❌ Volume Invalide",
                message: "Le volume doit être entre **0** et **100**.",
                note: "Veuillez fournir un niveau de volume valide."
            },
            success: {
                title: "## 🔊 Volume Mis à Jour",
                message: "Le volume a été réglé à **{volume}%**.",
                muted: "🔇 Muet",
                low: "🔉 Faible",
                medium: "🔊 Moyen",
                high: "🔊🔊 Élevé"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du réglage du volume.\\nVeuillez réessayer plus tard."
            }
        },
        shuffle: {
            command: {
                name: "shuffle",
                description: "Mélanger la file d'attente actuelle"
            },
            queueEmpty: {
                title: "## ❌ File d'Attente Vide",
                message: "La file d'attente est vide. Il n'y a pas de chansons à mélanger.",
                note: "Ajoutez d'abord des chansons à la file d'attente en utilisant `/play`."
            },
            success: {
                title: "## 🔀 File d'Attente Mélangée",
                message: "La file d'attente a été mélangée avec succès !",
                count: "**{count}** chanson{plural} ont été réarrangée{plural}."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du mélange de la file d'attente.\\nVeuillez réessayer plus tard."
            }
        },
        np: {
            command: {
                name: "np",
                description: "Affiche la chanson en cours de lecture avec une barre de progression"
            },
            title: "## En Cours de Lecture",
            nowPlaying: "**[{title}]({uri})**",
            by: "par **{author}**",
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la récupération de la piste actuelle.\\nVeuillez réessayer plus tard."
            }
        },
        queue: {
            command: {
                name: "queue",
                description: "Afficher la file d'attente actuelle"
            },
            title: "## 📋 File d'Attente Actuelle",
            titlePaginated: "## 📋 File d'Attente Actuelle (Page {currentPage}/{totalPages})",
            nowPlaying: "🎵 **En Cours de Lecture :**",
            track: "[{title}]({uri})",
            requestedBy: "Demandé par : {requester}",
            trackNumber: "**{number}.**",
            noMoreSongs: "Plus de chansons",
            buttons: {
                previous: "Précédent",
                next: "Suivant"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la récupération de la file d'attente.\\nVeuillez réessayer plus tard."
            }
        },
        remove: {
            command: {
                name: "remove",
                description: "Supprimer une chanson de la file d'attente par sa position"
            },
            queueEmpty: {
                title: "## ❌ File d'Attente Vide",
                message: "La file d'attente est vide. Il n'y a pas de chansons à supprimer.",
                note: "Ajoutez d'abord des chansons à la file d'attente en utilisant `/play`."
            },
            invalidPosition: {
                title: "## ❌ Position Invalide",
                message: "La position doit être entre **1** et **{max}**.",
                note: "La file d'attente contient **{count}** chanson{plural}."
            },
            success: {
                title: "## ✅ Chanson Supprimée",
                removed: "**Supprimée :** [{title}]({uri})",
                position: "**Position :** {position}",
                message: "La chanson a été supprimée de la file d'attente."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la suppression de la chanson.\\nVeuillez réessayer plus tard."
            }
        },
        move: {
            command: {
                name: "move",
                description: "Déplacer une piste vers une position différente dans la file d'attente"
            },
            queueEmpty: {
                title: "## ❌ File d'Attente Vide",
                message: "La file d'attente est vide. Il n'y a pas de chansons à déplacer.",
                note: "Ajoutez d'abord des chansons à la file d'attente en utilisant `/play`."
            },
            invalidPosition: {
                title: "## ❌ Position Invalide",
                message: "La position doit être entre **1** et **{max}**.",
                note: "La file d'attente contient **{count}** chanson{plural}."
            },
            samePosition: {
                title: "## ❌ Même Position",
                message: "Les positions de départ et d'arrivée ne peuvent pas être identiques.",
                note: "Veuillez fournir des positions différentes."
            },
            success: {
                title: "## ✅ Piste Déplacée",
                track: "**Piste :** [{title}]({uri})",
                from: "**De la position :** {from}",
                to: "**À la position :** {to}",
                message: "La piste a été déplacée avec succès."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du déplacement de la piste.\\nVeuillez réessayer plus tard."
            }
        },
        jump: {
            command: {
                name: "jump",
                description: "Sauter à une piste spécifique dans la file d'attente"
            },
            queueEmpty: {
                title: "## ❌ File d'Attente Vide",
                message: "La file d'attente est vide. Il n'y a pas de chansons vers lesquelles sauter.",
                note: "Ajoutez d'abord des chansons à la file d'attente en utilisant `/play`."
            },
            invalidPosition: {
                title: "## ❌ Position Invalide",
                message: "La position doit être entre **1** et **{max}**.",
                note: "La file d'attente contient **{count}** chanson{plural}."
            },
            success: {
                title: "## ⏭️ Sauté à la Piste",
                track: "**Piste :** [{title}]({uri})",
                position: "**Position :** {position}",
                message: "Sauté à la piste spécifiée dans la file d'attente."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du saut à la piste.\\nVeuillez réessayer plus tard."
            }
        },
        seek: {
            command: {
                name: "seek",
                description: "Rechercher un moment spécifique dans la piste actuelle"
            },
            invalidTime: {
                title: "## ❌ Temps Invalide",
                message: "Format de temps invalide. Utilisez l'un des suivants :",
                formats: "• **MM:SS** (ex., 1:30)\\n• **HH:MM:SS** (ex., 1:05:30)\\n• **Secondes** (ex., 90)",
                trackLength: "**Durée de la piste :** {length}"
            },
            success: {
                title: "## ⏩ Recherche à la Position",
                time: "**Temps :** {time}",
                track: "**Piste :** [{title}]({uri})",
                message: "La piste a été recherchée au temps spécifié."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la recherche.\\nVeuillez réessayer plus tard."
            }
        },
        trackinfo: {
            command: {
                name: "trackinfo",
                description: "Afficher des informations détaillées sur la piste actuelle"
            },
            trackInfo: {
                title: "## Informations sur la Piste",
                titleLabel: "**Titre :** [{title}]({uri})",
                artist: "**Artiste :** {artist}",
                duration: "**Durée :** {duration}",
                source: "**Source :** {source}"
            },
            progress: {
                title: "## Progression",
                current: "**Actuel :** {current}",
                total: "**Total :** {total}",
                progress: "**Progression :** {progress}%"
            },
            status: {
                title: "## 🎚️ État du Lecteur",
                volume: "**Volume :** {volume}%",
                loop: "**Boucle :** {loop}",
                status: "**État :** {status}",
                queue: "**File d'attente :** {count} piste{plural}"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la récupération des informations de la piste.\\nVeuillez réessayer plus tard."
            }
        },
        voteskip: {
            command: {
                name: "voteskip",
                description: "Voter pour passer la piste actuelle"
            },
            alreadyVoted: {
                title: "## ❌ Déjà Voté",
                message: "Vous avez déjà voté pour passer cette piste.",
                votes: "**Votes actuels :** {current}/{required}"
            },
            success: {
                title: "## ✅ Vote Ajouté",
                message: "Votre vote a été ajouté !",
                currentVotes: "**Votes actuels :** {current}/{required}",
                required: "**Requis :** {required} votes pour passer",
                moreNeeded: "{count} vote{plural} supplémentaire{plural} nécessaire{plural}."
            },
            skipped: {
                title: "## ⏭️ Piste Passée par Vote",
                message: "La piste a été passée !",
                votes: "**Votes :** {current}/{required}",
                required: "**Requis :** {required} votes"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du traitement du vote.\\nVeuillez réessayer plus tard."
            }
        },
        filters: {
            command: {
                name: "filters",
                description: "Contrôler les filtres audio"
            },
            cleared: {
                title: "## ✅ Filtres Effacés",
                message: "Tous les filtres audio ont été effacés.",
                note: "L'audio est maintenant revenu à la normale."
            },
            invalid: {
                title: "## ❌ Filtre Invalide",
                message: "Le filtre sélectionné est invalide.",
                note: "Veuillez sélectionner un filtre valide parmi les options."
            },
            success: {
                title: "## 🎛️ Filtre Appliqué",
                filter: "**Filtre :** {filter}",
                message: "Le filtre audio a été appliqué avec succès.",
                note: "Utilisez `/filters clear` pour supprimer tous les filtres."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de l'application du filtre.\\nVeuillez réessayer plus tard."
            }
        },
        play: {
            command: {
                name: "play",
                description: "Jouer une chanson à partir d'un nom ou d'un lien"
            },
            lavalinkManagerError: {
                title: "## ❌ Erreur du Gestionnaire Lavalink",
                message: "Le gestionnaire de nœuds Lavalink n'est pas initialisé.",
                note: "Veuillez contacter l'administrateur du bot."
            },
            noNodes: {
                title: "## ❌ Aucun Nœud Lavalink",
                message: "Aucun nœud Lavalink n'est actuellement disponible ({connected}/{total} connectés).",
                note: "Le bot tente de se reconnecter. Veuillez réessayer dans un instant."
            },
            spotifyError: {
                title: "## ❌ Erreur Spotify",
                message: "Échec de la récupération des données Spotify.",
                note: "Veuillez vérifier le lien et réessayer."
            },
            invalidResponse: {
                title: "## ❌ Réponse Invalide",
                message: "Réponse invalide de la source musicale.",
                note: "Veuillez réessayer ou utiliser une requête différente."
            },
            noResults: {
                title: "## ❌ Aucun Résultat",
                message: "Aucun résultat trouvé pour votre requête.",
                note: "Essayez un terme de recherche ou un lien différent."
            },
            success: {
                titleTrack: "## ✅ Piste Ajoutée",
                titlePlaylist: "## ✅ Playlist Ajoutée",
                trackAdded: "La piste a été ajoutée à la file d'attente.",
                playlistAdded: "**{count}** pistes ont été ajoutées à la file d'attente.",
                nowPlaying: "🎵 En cours de lecture...",
                queueReady: "⏸️ File d'attente prête"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du traitement de la demande.\\nVeuillez réessayer plus tard."
            }
        },
        search: {
            command: {
                name: "search",
                description: "Rechercher une chanson et sélectionner parmi les résultats"
            },
            lavalinkManagerError: {
                title: "## ❌ Erreur du Gestionnaire Lavalink",
                message: "Le gestionnaire de nœuds Lavalink n'est pas initialisé.",
                note: "Veuillez contacter l'administrateur du bot."
            },
            noNodes: {
                title: "## ❌ Aucun Nœud Lavalink",
                message: "Aucun nœud Lavalink n'est actuellement disponible ({connected}/{total} connectés).",
                note: "Le bot tente de se reconnecter. Veuillez réessayer dans un instant."
            },
            noResults: {
                title: "## ❌ Aucun Résultat",
                message: "Aucun résultat trouvé pour votre recherche.",
                note: "Essayez un terme de recherche différent."
            },
            playlistNotSupported: {
                title: "## ❌ Playlists Non Supportées",
                message: "Les playlists ne sont pas supportées dans la recherche.",
                note: "Utilisez la commande `/play` pour les playlists."
            },
            results: {
                title: "## 🔍 Résultats de Recherche",
                query: "**Requête :** {query}",
                track: "**{number}.** [{title}]({uri})\\n   └ {author} • {duration}"
            },
            buttons: {
                cancel: "Annuler"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la recherche.\nVeuillez réessayer plus tard."
            }
        },
        loop: {
            command: {
                name: "loop",
                description: "Définir le mode de répétition pour la file d'attente"
            },
            track: {
                title: "## 🔁 Répétition du Morceau Activée",
                message: "Le morceau actuel sera répété indéfiniment.",
                note: "Utilise `/loop off` pour désactiver."
            },
            queue: {
                title: "## 🔁 Répétition de la File Activée",
                message: "Toute la file d'attente sera maintenant répétée.",
                note: "Utilise `/loop off` pour désactiver."
            },
            off: {
                title: "## ❌ Répétition Désactivée",
                message: "La répétition a été désactivée.",
                note: "Les morceaux joueront dans l'ordre et s'arrêteront à la fin de la file."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur est survenue lors du réglage du mode de répétition.\nVeuillez réessayer plus tard."
            }
        },
        leave: {
            command: {
                name: "leave",
                description: "Faire quitter le salon vocal au bot"
            },
            success: {
                title: "## 👋 Salon Vocal Quitté",
                message: "Le bot a quitté le salon vocal.",
                note: "Utilise `/play` pour recommencer à jouer de la musique."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur est survenue en quittant le salon vocal.\nVeuillez réessayer plus tard."
            }
        }
    },
    playlist: {
        createplaylist: {
            command: {
                name: "createplaylist",
                description: "Créer une nouvelle playlist"
            },
            alreadyExists: {
                title: "## ❌ La Playlist Existe Déjà",
                message: "Une playlist avec le nom **\\\"{name}\\\"** existe déjà.",
                note: "Veuillez choisir un nom différent."
            },
            success: {
                title: "## ✅ Playlist Créée",
                message: "Votre playlist **\\\"{name}\\\"** a été créée avec succès !",
                visibility: "**Visibilité :** {visibility}",
                server: "**Serveur :** {server}",
                private: "🔒 Privée",
                public: "🌐 Publique"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la création de la playlist.\\nVeuillez réessayer plus tard."
            }
        },
        addsong: {
            command: {
                name: "addsong",
                description: "Ajouter une chanson à une playlist"
            },
            notFound: {
                title: "## ❌ Playlist Non Trouvée",
                message: "La playlist **\\\"{name}\\\"** n'existe pas.",
                note: "Veuillez vérifier le nom de la playlist et réessayer."
            },
            accessDenied: {
                title: "## 🔒 Accès Refusé",
                message: "Vous n'avez pas la permission de modifier cette playlist.",
                note: "Seul le propriétaire de la playlist peut ajouter des chansons."
            },
            success: {
                title: "## ✅ Chanson Ajoutée",
                song: "**Chanson :** {song}",
                playlist: "**Playlist :** {playlist}",
                message: "La chanson a été ajoutée avec succès à votre playlist !"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de l'ajout de la chanson.\\nVeuillez réessayer plus tard."
            }
        },
        deleteplaylist: {
            command: {
                name: "deleteplaylist",
                description: "Supprimer une playlist"
            },
            notFound: {
                title: "## ❌ Playlist Non Trouvée",
                message: "La playlist **\\\"{name}\\\"** n'existe pas.",
                note: "Veuillez vérifier le nom de la playlist et réessayer."
            },
            accessDenied: {
                title: "## 🔒 Accès Refusé",
                message: "Vous n'avez pas la permission de supprimer cette playlist.",
                note: "Seul le propriétaire de la playlist peut la supprimer."
            },
            success: {
                title: "## ✅ Playlist Supprimée",
                message: "La playlist **\\\"{name}\\\"** a été supprimée avec succès."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la suppression de la playlist.\\nVeuillez réessayer plus tard."
            }
        },
        deletesong: {
            command: {
                name: "deletesong",
                description: "Supprimer une chanson d'une playlist"
            },
            notFound: {
                title: "## ❌ Playlist Non Trouvée",
                message: "La playlist **\\\"{name}\\\"** n'existe pas.",
                note: "Veuillez vérifier le nom de la playlist et réessayer."
            },
            success: {
                title: "## ✅ Chanson Supprimée",
                song: "**Chanson :** {song}",
                playlist: "**Playlist :** {playlist}",
                message: "La chanson a été supprimée avec succès de votre playlist."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la suppression de la chanson.\\nVeuillez réessayer plus tard."
            }
        },
        savequeue: {
            command: {
                name: "savequeue",
                description: "Sauvegarder la file d'attente actuelle comme playlist"
            },
            queueEmpty: {
                title: "## ❌ File d'Attente Vide",
                message: "La file d'attente est vide. Rien à sauvegarder.",
                note: "Ajoutez d'abord des chansons à la file d'attente !"
            },
            alreadyExists: {
                title: "## ❌ La Playlist Existe Déjà",
                message: "Une playlist nommée **\\\"{name}\\\"** existe déjà.",
                note: "Veuillez choisir un nom différent."
            },
            success: {
                title: "## ✅ File d'Attente Sauvegardée !",
                message: "File d'attente sauvegardée comme playlist **\\\"{name}\\\"**",
                tracks: "**Pistes :** {count}"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la sauvegarde de la file d'attente.\\nVeuillez réessayer plus tard."
            }
        },
        myplaylists: {
            command: {
                name: "myplaylists",
                description: "Lister toutes les playlists que vous avez créées"
            },
            noPlaylists: {
                title: "## 📋 Aucune Playlist Trouvée",
                message: "Vous n'avez encore créé aucune playlist.",
                note: "Utilisez `/createplaylist` pour créer votre première playlist !"
            },
            title: "## 📂 Vos Playlists (Page {currentPage}/{totalPages})",
            playlistItem: "**{number}.** **{name}**\\n   • Visibilité : **{visibility}**\\n   • Serveur : {server}\\n   • Chansons : **{count}**",
            visibilityPrivate: "🔒 Privée",
            visibilityPublic: "🌐 Publique",
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la récupération de vos playlists.\\nVeuillez réessayer plus tard."
            }
        },
        allplaylists: {
            command: {
                name: "allplaylists",
                description: "Lister toutes les playlists publiques"
            },
            noPlaylists: {
                title: "## 📋 Aucune Playlist Publique Trouvée",
                message: "Il n'y a pas de playlists publiques disponibles.",
                note: "Créez une playlist publique en utilisant `/createplaylist` !"
            },
            title: "## 🌐 Playlists Publiques (Page {currentPage}/{totalPages})",
            playlistItem: "**{number}.** **{name}**\\n   • Créée par : {creator}\\n   • Serveur : {server}\\n   • Chansons : **{count}**",
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la récupération des playlists publiques.\\nVeuillez réessayer plus tard."
            }
        },
        showsongs: {
            command: {
                name: "showsongs",
                description: "Afficher toutes les chansons d'une playlist"
            },
            notFound: {
                title: "## ❌ Playlist Non Trouvée",
                message: "La playlist **\\\"{name}\\\"** n'existe pas.",
                note: "Veuillez vérifier le nom de la playlist et réessayer."
            },
            accessDenied: {
                title: "## 🔒 Accès Refusé",
                message: "Vous n'avez pas la permission de voir cette playlist.",
                note: "Cette playlist est privée et seul le propriétaire peut la voir."
            },
            empty: {
                title: "## 📋 Chansons dans \\\"{name}\\\"",
                message: "Cette playlist est vide. Ajoutez des chansons en utilisant `/addsong` !"
            },
            title: "## Chansons dans \\\"{name}\\\" (Page {currentPage}/{totalPages})",
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de l'affichage des chansons de la playlist.\\nVeuillez réessayer plus tard."
            }
        },
        playcustomplaylist: {
            command: {
                name: "playcustomplaylist",
                description: "Jouer une playlist personnalisée"
            },
            notFound: {
                title: "## ❌ Playlist Non Trouvée",
                message: "La playlist **\\\"{name}\\\"** n'existe pas.",
                note: "Veuillez vérifier le nom de la playlist et réessayer."
            },
            accessDenied: {
                title: "## 🔒 Accès Refusé",
                message: "Vous n'avez pas la permission de jouer cette playlist.",
                note: "Cette playlist est privée et seul le propriétaire peut la jouer."
            },
            empty: {
                title: "## ❌ Playlist Vide",
                message: "La playlist **\\\"{name}\\\"** est vide.",
                note: "Ajoutez d'abord des chansons à la playlist !"
            },
            lavalinkManagerError: {
                title: "## ❌ Erreur du Gestionnaire Lavalink",
                message: "Le gestionnaire de nœuds Lavalink n'est pas initialisé.",
                note: "Veuillez contacter l'administrateur du bot."
            },
            noNodes: {
                title: "## ❌ Aucun Nœud Lavalink",
                message: "Aucun nœud Lavalink n'est actuellement disponible ({connected}/{total} connectés).",
                note: "Le bot tente de se reconnecter. Veuillez réessayer dans un instant."
            },
            resolveError: {
                title: "## ❌ Erreur de Résolution de Chanson",
                message: "Échec de la résolution d'une ou plusieurs chansons de la playlist.",
                note: "Veuillez vérifier la playlist et réessayer."
            },
            success: {
                title: "## Lecture de la Playlist",
                message: "Lecture en cours de la playlist **\\\"{name}\\\"**",
                songs: "**Chansons :** {count}"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la lecture de la playlist.\\nVeuillez réessayer plus tard."
            }
        }
    },
    utility: {
        twentyfourseven: {
            command: {
                name: "247",
                description: "Activer/désactiver le mode 24/7 (garder le bot dans le canal vocal)"
            },
            accessDenied: {
                title: "## ❌ Accès Refusé",
                message: "Seul le propriétaire du serveur peut activer/désactiver le mode 24/7."
            },
            enabled: {
                title: "## ✅ Mode 24/7 Activé",
                message: "Le mode 24/7 a été **activé** pour ce serveur.",
                note: "🔄 Le bot restera dans le canal vocal même lorsque la file d'attente est vide."
            },
            disabled: {
                title: "## ❌ Mode 24/7 Désactivé",
                message: "Le mode 24/7 a été **désactivé** pour ce serveur.",
                note: "⏹️ Le bot quittera le canal vocal lorsque la file d'attente se terminera."
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la mise à jour du mode 24/7.",
                note: "Veuillez réessayer plus tard."
            }
        },
        history: {
            command: {
                name: "history",
                description: "Afficher les pistes récemment jouées"
            },
            noHistory: {
                title: "## 📜 Aucun Historique Trouvé",
                message: "Aucun historique de lecture trouvé pour ce serveur.",
                note: "Jouez quelques chansons pour créer votre historique !"
            },
            title: "## 📜 Historique de Lecture",
            titlePaginated: "## 📜 Historique de Lecture (Page {currentPage}/{totalPages})",
            noMoreSongs: "- Plus de chansons dans l'historique.",
            buttons: {
                previous: "Précédent",
                next: "Suivant"
            },
            errors: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors de la récupération de l'historique.",
                note: "Veuillez réessayer plus tard."
            }
        }
    },
    events: {
        interactionCreate: {
            noGuild: "❌ **Cette commande ne peut être utilisée que sur un serveur.**",
            commandNotFound: "❌ **Commande non trouvée !**",
            noPermission: "❌ **Vous n'avez pas la permission d'utiliser cette commande.**",
            errorOccurred: "❌ **Une erreur s'est produite : {message}**",
            unexpectedError: "❌ **Une erreur inattendue s'est produite. Veuillez réessayer plus tard.**",
            errorTryAgain: "❌ Une erreur s'est produite. Veuillez réessayer."
        }
    },
    utils: {
        voiceChannelCheck: {
            noVoiceChannel: {
                title: "## ❌ Aucun Canal Vocal",
                message: "Vous devez être dans un canal vocal pour utiliser cette commande.",
                note: "Veuillez rejoindre un canal vocal et réessayer."
            },
            wrongChannel: {
                title: "## Rejoindre le Canal Vocal",
                message: "Le bot est actuellement actif dans **{channelName}**.",
                note: "Veuillez rejoindre **{channelName}** pour utiliser les commandes musicales."
            }
        },
        playerValidation: {
            queueEmpty: {
                title: "## ❌ File d'Attente Vide",
                message: "La file d'attente est vide. Aucune chanson disponible.",
                note: "Ajoutez d'abord des chansons à la file d'attente en utilisant `/play`."
            },
            noSongPlaying: {
                title: "## ❌ Aucune Chanson en Cours",
                message: "Aucune chanson n'est actuellement en cours de lecture.",
                note: "Utilisez `/play` pour commencer à jouer de la musique."
            },
            noMusicPlaying: {
                title: "## ❌ Aucune Musique en Cours",
                message: "Aucune musique n'est actuellement en cours de lecture et la file d'attente est vide.",
                note: "Utilisez `/play` pour commencer à jouer de la musique."
            }
        },
        responseHandler: {
            defaultError: {
                title: "## ❌ Erreur",
                message: "Une erreur s'est produite lors du traitement de la commande.",
                note: "Veuillez réessayer plus tard."
            },
            commandError: "❌ Une erreur s'est produite lors du traitement de la commande {commandName}."
        }
    },
    console: {
        bot: {
            clientLogged: "Client connecté en tant que {tag}",
            musicSystemReady: "Système Musical Riffy Prêt 🎵",
            lavalinkError: "Erreur d'initialisation du lecteur : {message}",
            nodeManagerStatus: "Gestionnaire de Nœuds : {available}/{total} nœuds disponibles",
            nodeStatus: "État du Nœud :",
            nodeInfo: "{icon} {name} ({host}:{port}) - {status}{error}",
            commandsLoaded: "Total de Commandes Chargées : {count}",
            commandLoadFailed: "Échec du chargement : {name} - Données ou propriété run manquantes",
            commandLoadError: "Erreur de chargement de {name} : {message}",
            tokenVerification: "🔐 VÉRIFICATION DU TOKEN",
            tokenAuthFailed: "Authentification Échouée ❌",
            tokenError: "Erreur : Activez les Intents ou Réinitialisez un Nouveau Token",
            databaseOnline: "Base de Données En Ligne ✅",
            databaseStatus: "🕸️  ÉTAT DE LA BASE DE DONNÉES",
            databaseConnection: "🕸️  CONNEXION À LA BASE DE DONNÉES",
            databaseFailed: "Connexion Échouée ❌",
            databaseError: "Erreur : {message}",
            unhandledRejection: "Rejet Non Géré :",
            uncaughtException: "Exception Non Capturée :",
            riffyThumbnailError: "[ Riffy ] Ignorer l'erreur de miniature : {message}"
        },
        events: {
            rest: {
                commandsRegistered: "{count} commandes d'application (/) enregistrées avec succès globalement ✅",
                commandsFailed: "Échec de l'enregistrement des commandes ❌",
                error: "Erreur : {message}",
                details: "Détails : {details}"
            },
            interaction: {
                commandNotFound: "Commande non trouvée : {commandName}",
                errorExecuting: "Erreur d'exécution de la commande {commandName} :",
                errorHelpButton: "Erreur de gestion du bouton retour d'aide :",
                errorHelpSelect: "Erreur de gestion de la sélection de catégorie d'aide :",
                unexpectedError: "Erreur inattendue :",
                failedToSendError: "Échec de l'envoi du message d'erreur :"
            }
        },
        database: {
            uriNotDefined: "L'URI de la base de données n'est pas défini dans la configuration.",
            skippingConnection: "Passage de la connexion à la base de données car aucune URI n'a été fournie.",
            connected: "Connecté à la base de données ✅",
            connectionFailed: "Échec de la connexion à la base de données. Continuation sans fonctionnalité de base de données."
        },
        lavalink: {
            nodesConfigured: "Nœuds configurés : {count}",
            riffyInitialized: "Initialisé avec {count} nœud(s)",
            nodeKeys: "Clés de nœud :",
            failedToInitialize: "Échec de l'initialisation de Riffy : {message}",
            riffyReinitialized: "Riffy réinitialisé",
            failedToReinitialize: "Échec de la réinitialisation de Riffy : {message}",
            nodeConnected: "Connecté : {name} ({host}:{port}) • {available}/{total} actifs",
            nodeDisconnected: "Déconnecté : {name} ({host}:{port}) • {available}/{total} actifs",
            retryLimitReported: "Limite de tentatives signalée par {name} ; la boucle de reconnexion continue",
            nodeError: "Erreur : {name} ({host}:{port}) • {message}",
            nodeStatus: "{available}/{total} actifs",
            waitingForConnection: "En attente de connexion du nœud Lavalink...",
            nodeAvailable: "Nœud disponible ({count} connectés)",
            noNodesConnected: "Aucun nœud connecté ({connected}/{total}) — tentative de reconnexion...",
            nodeStatusReport: "État du Nœud : {connected}/{total} connectés"
        },
        player: {
            lacksPermissions: "Le bot manque des permissions nécessaires pour envoyer des messages dans ce canal.",
            errorSendingMessage: "Erreur d'envoi du message : {message}",
            trackException: "Exception de Piste pour le serveur {guildId} : {message}",
            trackStuck: "Piste Bloquée pour le serveur {guildId} : {message}",
            trackNull: "La piste est nulle ou manque d'informations pour le serveur {guildId} - ignorer l'événement",
            playerInvalid: "Lecteur invalide ou détruit pour le serveur {guildId} - ignorer l'événement",
            channelNotFound: "Canal non trouvé pour le serveur {guildId}",
            errorSavingHistory: "Erreur de sauvegarde dans l'historique :",
            errorMusicCard: "Erreur de création ou d'envoi de la carte musicale : {message}",
            autoplayDisabled: "La lecture automatique est désactivée pour le serveur : {guildId}",
            errorQueueEnd: "Erreur de gestion de la fin de la file d'attente :",
            errorCleanupPrevious: "Erreur de nettoyage du message de piste précédent :",
            errorCleanupTrack: "Erreur de nettoyage du message de piste :",
            lyricsFetchError: "❌ Erreur de récupération des paroles : {message}",
            unableToSendMessage: {
                title: "## ⚠️ Impossible d'envoyer le message",
                message: "Impossible d'envoyer le message. Vérifiez les permissions du bot."
            },
            trackError: {
                title: "## ⚠️ Erreur de Piste",
                message: "Impossible de charger la piste.",
                skipping: "Passage à la chanson suivante..."
            },
            unableToLoadCard: {
                title: "## ⚠️ Impossible de charger la carte de piste",
                message: "Impossible de charger la carte de piste. Poursuite de la lecture..."
            },
            queueEnd: {
                noMoreAutoplay: "⚠️ **Plus de pistes à lire automatiquement. Déconnexion...**",
                queueEndedAutoplayDisabled: "🎶 **La file d'attente est terminée. La lecture automatique est désactivée.**",
                queueEmpty: "👾 **File d'attente vide ! Déconnexion...**",
                twentyfoursevenEmpty: "🔄 **Mode 24/7 : Le bot restera dans le canal vocal. La file d'attente est vide.**"
            },
            voiceChannelRequired: {
                title: "## 🔒 Canal Vocal Requis",
                message: "Vous devez être dans le même canal vocal pour utiliser les contrôles !"
            },
            controls: {
                skip: "⏭️ **Passage à la chanson suivante...**",
                queueCleared: "🗑️ **La file d'attente a été vidée !**",
                playbackStopped: "⏹️ **La lecture a été arrêtée et le lecteur a été détruit !**",
                alreadyPaused: "⏸️ **La lecture est déjà en pause !**",
                playbackPaused: "⏸️ **La lecture a été mise en pause !**",
                alreadyResumed: "▶️ **La lecture a déjà été reprise !**",
                playbackResumed: "▶️ **La lecture a été reprise !**",
                volumeMax: "🔊 **Le volume est déjà au maximum !**",
                volumeMin: "🔉 **Le volume est déjà au minimum !**",
                volumeChanged: "🔊 **Le volume a été changé à {volume}% !**",
                trackLoopActivated: "🔁 **La boucle de piste est activée !**",
                queueLoopActivated: "🔁 **La boucle de file d'attente est activée !**",
                loopDisabled: "❌ **La boucle est désactivée !**"
            },
            lyrics: {
                noSongPlaying: "🚫 **Aucune chanson n'est actuellement en cours de lecture.**",
                notFound: "❌ **Paroles non trouvées !**",
                liveTitle: "## Paroles en Direct : {title}",
                syncing: "🔄 Synchronisation des paroles...",
                fullTitle: "## Paroles Complètes : {title}",
                stopButton: "Arrêter les Paroles",
                fullButton: "Paroles Complètes",
                deleteButton: "Supprimer"
            },
            trackInfo: {
                title: "**Titre :**",
                author: "**Artiste :**",
                length: "**Durée :**",
                requester: "**Demandé par :**",
                source: "**Source :**",
                progress: "**Progression :**",
                unknownArtist: "Artiste Inconnu",
                unknown: "Inconnu"
            },
            controlLabels: {
                loop: "Boucle",
                disable: "Désactiver",
                skip: "Passer",
                queue: "File",
                clear: "Vider",
                stop: "Arrêter",
                pause: "Pause",
                resume: "Reprendre",
                volUp: "Vol +",
                volDown: "Vol -"
            }
        }
    }
};
export default lang;