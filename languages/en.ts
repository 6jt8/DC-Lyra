const lang: Record<string, any> = {
    meta: {
        name: "English",
        code: "en"
    },
    help: {
        command: {
            name: "help",
            description: "Get information about the bot and its commands",
            category: {
                name: "category",
                description: "Select a category to view",
                choices: {
                    main: "🏠 Main Menu",
                    music: "🎵 Music Commands",
                    playlist: "📋 Playlist Commands",
                    basic: "💜 Basic Commands",
                    utility: "🔧 Utility Commands"
                }
            }
        },
        categories: {
            main: {
                name: "Main Menu",
                emoji: "🏠",
                description: "Welcome to the help menu"
            },
            music: {
                name: "Music Commands",
                emoji: "🎵",
                description: "Control music playback and settings"
            },
            playlist: {
                name: "Playlist Commands",
                emoji: "📋",
                description: "Manage your playlists"
            },
            basic: {
                name: "Basic Commands",
                emoji: "⚙️",
                description: "General bot information and utilities"
            },
            utility: {
                name: "Utility Commands",
                emoji: "🔧",
                description: "Additional utility features"
            }
        },
        mainMenu: {
            header: {
                title: "# 🎵 {botName} Help Menu",
                welcome: "**Welcome to {botName}!**",
                subtitle: "Your ultimate music companion on Discord."
            },
            statistics: {
                title: "## Statistics",
                commands: "• **Commands:** {totalCommands}",
                servers: "• **Servers:** {totalServers}",
                users: "• **Users:** {totalUsers}",
                uptime: "• **Uptime:** {uptimeString}",
                ping: "• **Ping:** {ping}ms"
            },
            categories: {
                title: "## 📂 Available Categories",
                music: "{emoji} **{name}** - {count} commands",
                playlist: "{emoji} **{name}** - {count} commands",
                basic: "{emoji} **{name}** - {count} commands",
                utility: "{emoji} **{name}** - {count} commands",
                footer: "**Select a category below to view detailed commands.**"
            },
            footer: { version: "**{botName}**", developer: "" },
            selectMenu: {
                placeholder: "📂 Select a category to view commands...",
                musicDescription: "{count} commands available",
                playlistDescription: "{count} commands available",
                basicDescription: "{count} commands available",
                utilityDescription: "{count} commands available"
            },
            buttons: {
                supportServer: "Support Server",
                github: "GitHub"
            }
        },
        categoryPage: {
            noCommands: {
                title: "## ❌ No Commands Found",
                message: "No commands available in the **{categoryName}** category.",
                backToHelp: "Use `/help` to return to the main menu."
            },
            header: {
                title: "# {emoji} {categoryName}",
                description: "{description}",
                count: "**{count}** command{plural} available"
            },
            commands: {
                title: "## Commands",
                titlePaginated: "## Commands (Page {currentPage}/{totalPages})",
                item: "**{num}.** `/{commandName}`\n   {description}",
                noDescription: "No description available."
            },
            footer: { version: "**{botName}**", developer: "" },
            buttons: {
                backToMain: "🏠 Back to Main Menu",
                supportServer: "Support Server",
                github: "GitHub"
            }
        },
        errors: {
            general: "❌ **An error occurred while fetching the help menu.**",
            fallback: "❌ An error occurred while fetching the help menu.",
            fallbackDetails: "**Bot:** {botName}\n**Commands:** {totalCommands}\n**Servers:** {totalServers}\n**Support:** {supportServer}"
        }
    },
    language: {
        command: {
            name: "language",
            description: "Set the bot's language for this server",
            option: {
                name: "lang",
                description: "Select a language"
            }
        },
        current: {
            title: "🌐 Current Language",
            description: "The current language for this server is: **{language}**",
            global: "Global default (from config): **{language}**"
        },
        changed: {
            title: "✅ Language Changed",
            description: "Server language has been changed to: **{language}**",
            note: "The bot will now use this language for all commands in this server."
        },
        available: {
            title: "📚 Available Languages",
            description: "Select a language from the list below:",
            list: "**Available Languages:**\n{list}",
            item: "• **{name}** (`{code}`)"
        },
        errors: {
            notFound: "❌ **Language not found!**\nThe language `{code}` does not exist.",
            failed: "❌ **Failed to set language!**\n{error}",
            noPermission: "❌ **You don't have permission to change the language!**\nYou need `Manage Server` permission."
        },
        info: {
            title: "ℹ️ Language Information",
            description: "**Current Server Language:** {serverLang}\n**Global Default Language:** {globalLang}\n\n**Available Languages:** {count}",
            reset: "To reset to global default, use `/language reset`"
        }
    },
    ping: {
        command: {
            name: "ping",
            description: "Check the bot latency and response time"
        },
        header: {
            title: "# Bot Latency",
            botName: "**{botName}** - Lyra Bot",
            subtitle: "Check the bot's response time and connection status"
        },
        metrics: {
            title: "## Performance Metrics",
            responseTime: "**Response Time:** {latency}ms",
            websocketPing: "**Websocket Ping:** {ping}ms",
            botUptime: "**Bot Uptime:** {uptime}",
            connectionSpeed: {
                excellent: "🟢 Excellent connection speed",
                good: "🟡 Good connection speed",
                slow: "🔴 Slow connection speed"
            }
        },
        footer: { version: "**{botName}**", developer: "" },
        errors: {
            title: "## ❌ Error",
            message: "An error occurred while checking latency.\nPlease try again later.",
            fallback: "❌ An error occurred while checking latency."
        }
    },
    stats: {
        command: {
            name: "stats",
            description: "Show bot statistics and server information"
        },
        header: {
            title: "# Bot Statistics",
            botName: "**{botName}** - Lyra Bot",
            developer: ""
        },
        botInfo: {
            title: "## Bot Information",
            servers: "• **Servers:** {count}",
            users: "• **Users:** {count}",
            channels: "• **Channels:** {count}",
            uptime: "• **Uptime:** {uptime}"
        },
        musicStats: {
            title: "## Music Statistics",
            activePlayers: "• **Active Players:** {count}",
            totalPlayers: "• **Total Players:** {count}",
            currentTrack: "• **Current Track:** {track}"
        },
        systemInfo: {
            title: "## System Information",
            cpu: "• **CPU:** {cpu}",
            platform: "• **Platform:** {platform}",
            nodejs: "• **Node.js:** {version}",
            discordjs: "• **Discord.js:** {version}"
        },
        memory: {
            title: "## Memory & Performance",
            memoryUsage: "**Memory Usage:**",
            used: "• Used: {used}",
            total: "• Total: {total}",
            systemMemory: "**System Memory:**",
            systemUsed: "• Used: {used}",
            systemFree: "• Free: {free}",
            performance: "**Performance:**",
            ping: "• Ping: {ping}ms",
            shards: "• Shards: {count}",
            commands: "• Commands: {count}"
        },
        footer: { version: "**{botName}**", developer: "" },
        errors: {
            title: "## ❌ Error",
            message: "An error occurred while retrieving statistics.\nPlease try again later.",
            fallback: "❌ An error occurred while retrieving statistics."
        }
    },
    support: {
        command: {
            name: "support",
            description: "Get support server link and important links"
        },
        header: {
            title: "# Support & Links",
            botName: "**{botName}** - Lyra Bot",
            subtitle: "Get help, report issues, or connect with us!"
        },
        links: {
            title: "## Important Links",
            supportServer: {
                title: "**Support Server**",
                description: "Join our Discord server for help, updates, and community!",
                link: "[Click here to join]({url})"
            },
            github: {
                title: "**GitHub**",
                description: "Check out our code and contribute!",
                link: "[Visit GitHub]({url})"
            },
            youtube: {
                title: "**YouTube**",
                description: "Watch tutorials and updates!",
                link: "[Subscribe]({url})"
            },
            website: {
                title: "**Website**",
                description: "Visit our official website!",
                link: "[Visit Website]({url})"
            }
        },
        footer: { version: "**{botName}**", developer: "" },
        buttons: {
            supportServer: "Support Server",
            github: "GitHub",
            youtube: "YouTube"
        },
        errors: {
            title: "## ❌ Error",
            message: "An error occurred while fetching support information.\nPlease try again later.",
            fallback: "❌ An error occurred while fetching support information."
        }
    },
    invite: {
        command: {
            name: "invite",
            description: "Get the bot invite link to add it to your server"
        },
        title: "Invite Bot",
        description: "Add this bot to your server!",
        features: {
            title: "Features",
            music: "🎵 High-quality music playback",
            commands: "⚡ 40+ slash commands",
            playlists: "📚 Custom playlists",
            filters: "🎛️ Audio filters & effects",
            languages: "🌍 Multi-language support",
            support: "💎 24/7 music support"
        },
        permissions: {
            title: "Permissions",
            description: "The bot requires these permissions to work properly"
        },
        buttons: {
            invite: "Invite Bot",
            support: "Support Server",
            website: "Website"
        },
        footer: "Thank you for using Lyra!",
        errors: {
            title: "## ❌ Error",
            message: "An error occurred while generating the invite link.\nPlease try again later."
        }
    },
    music: {
        autoplay: {
            command: {
                name: "autoplay",
                description: "Toggle autoplay for the server"
            },
            enabled: {
                title: "## ✅ Autoplay Enabled",
                message: "Autoplay has been **enabled** for this server.",
                note: "🎵 The bot will automatically play similar songs when the queue ends."
            },
            disabled: {
                title: "## ❌ Autoplay Disabled",
                message: "Autoplay has been **disabled** for this server.",
                note: "⏹️ The bot will stop playing when the queue ends."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while updating autoplay settings.\nPlease try again later."
            }
        },
        pause: {
            command: {
                name: "pause",
                description: "Pause the current song"
            },
            success: {
                title: "## ⏸️ Music Paused",
                message: "The current track has been paused.",
                note: "Use `/resume` to continue playing."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while pausing the music.\nPlease try again later."
            }
        },
        resume: {
            command: {
                name: "resume",
                description: "Resume the current song"
            },
            success: {
                title: "## ▶️ Music Resumed",
                message: "The current track has been resumed.",
                note: "Music is now playing."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while resuming the music.\nPlease try again later."
            }
        },
        skip: {
            command: {
                name: "skip",
                description: "Skip the current song"
            },
            success: {
                title: "## ⏭️ Song Skipped",
                message: "The current track has been skipped.",
                nextSong: "Playing next song in queue...",
                queueEmpty: "Queue is empty."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while skipping the song.\nPlease try again later."
            }
        },
        previous: {
            command: {
                name: "previous",
                description: "Play the previous track again"
            },
            noPrevious: {
                title: "## ❌ No Previous Track",
                message: "There is no previous track to play.",
                note: "Play some songs first to build up a history."
            },
            success: {
                title: "## ⏮️ Playing Previous Track",
                message: "Now playing the previous track"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while playing the previous track.\nPlease try again later."
            }
        },
        clear: {
            command: {
                name: "clear",
                description: "Clear the entire queue"
            },
            success: {
                title: "## 🗑️ Queue Cleared",
                message: "Successfully cleared **{count}** song{plural} from the queue.",
                note: "The current playing song will continue."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while clearing the queue.\nPlease try again later."
            }
        },
        stop: {
            command: {
                name: "stop",
                description: "Stop the current song and destroy the player"
            },
            success: {
                title: "## ⏹️ Music Stopped",
                message24_7: "Music stopped. Player kept alive (24/7 mode enabled).",
                messageNormal: "The music has been stopped and the player has been destroyed.",
                note: "Use `/play` to start playing music again."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while stopping the music.\nPlease try again later."
            }
        },
        volume: {
            command: {
                name: "volume",
                description: "Set the volume of the current song"
            },
            invalid: {
                title: "## ❌ Invalid Volume",
                message: "Volume must be between **0** and **100**.",
                note: "Please provide a valid volume level."
            },
            success: {
                title: "## 🔊 Volume Updated",
                message: "Volume has been set to **{volume}%**.",
                muted: "🔇 Muted",
                low: "🔉 Low",
                medium: "🔊 Medium",
                high: "🔊🔊 High"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while setting the volume.\nPlease try again later."
            }
        },
        shuffle: {
            command: {
                name: "shuffle",
                description: "Shuffle the current song queue"
            },
            queueEmpty: {
                title: "## ❌ Queue Empty",
                message: "The queue is empty. There are no songs to shuffle.",
                note: "Add some songs to the queue first using `/play`."
            },
            success: {
                title: "## 🔀 Queue Shuffled",
                message: "The queue has been shuffled successfully!",
                count: "**{count}** song{plural} have been rearranged."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while shuffling the queue.\nPlease try again later."
            }
        },
        np: {
            command: {
                name: "np",
                description: "Displays the currently playing song with a progress bar"
            },
            title: "## Now Playing",
            nowPlaying: "**[{title}]({uri})**",
            by: "by **{author}**",
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while fetching the current track.\nPlease try again later."
            }
        },
        queue: {
            command: {
                name: "queue",
                description: "Show the current song queue"
            },
            title: "## 📋 Current Queue",
            titlePaginated: "## 📋 Current Queue (Page {currentPage}/{totalPages})",
            nowPlaying: "🎵 **Now Playing:**",
            track: "[{title}]({uri})",
            requestedBy: "Requested by: {requester}",
            trackNumber: "**{number}.**",
            noMoreSongs: "No more songs",
            buttons: {
                previous: "Previous",
                next: "Next"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while fetching the queue.\nPlease try again later."
            }
        },
        remove: {
            command: {
                name: "remove",
                description: "Remove a song from the queue by its position"
            },
            queueEmpty: {
                title: "## ❌ Queue Empty",
                message: "The queue is empty. There are no songs to remove.",
                note: "Add some songs to the queue first using `/play`."
            },
            invalidPosition: {
                title: "## ❌ Invalid Position",
                message: "Position must be between **1** and **{max}**.",
                note: "The queue has **{count}** song{plural}."
            },
            success: {
                title: "## ✅ Song Removed",
                removed: "**Removed:** [{title}]({uri})",
                position: "**Position:** {position}",
                message: "The song has been removed from the queue."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while removing the song.\nPlease try again later."
            }
        },
        move: {
            command: {
                name: "move",
                description: "Move a track to a different position in the queue"
            },
            queueEmpty: {
                title: "## ❌ Queue Empty",
                message: "The queue is empty. There are no songs to move.",
                note: "Add some songs to the queue first using `/play`."
            },
            invalidPosition: {
                title: "## ❌ Invalid Position",
                message: "Position must be between **1** and **{max}**.",
                note: "The queue has **{count}** song{plural}."
            },
            samePosition: {
                title: "## ❌ Same Position",
                message: "From and to positions cannot be the same.",
                note: "Please provide different positions."
            },
            success: {
                title: "## ✅ Track Moved",
                track: "**Track:** [{title}]({uri})",
                from: "**From position:** {from}",
                to: "**To position:** {to}",
                message: "The track has been moved successfully."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while moving the track.\nPlease try again later."
            }
        },
        jump: {
            command: {
                name: "jump",
                description: "Jump to a specific track in the queue"
            },
            queueEmpty: {
                title: "## ❌ Queue Empty",
                message: "The queue is empty. There are no songs to jump to.",
                note: "Add some songs to the queue first using `/play`."
            },
            invalidPosition: {
                title: "## ❌ Invalid Position",
                message: "Position must be between **1** and **{max}**.",
                note: "The queue has **{count}** song{plural}."
            },
            success: {
                title: "## ⏭️ Jumped to Track",
                track: "**Track:** [{title}]({uri})",
                position: "**Position:** {position}",
                message: "Jumped to the specified track in the queue."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while jumping to the track.\nPlease try again later."
            }
        },
        seek: {
            command: {
                name: "seek",
                description: "Seek to a specific time in the current track"
            },
            invalidTime: {
                title: "## ❌ Invalid Time",
                message: "Invalid time format. Use one of the following:",
                formats: "• **MM:SS** (e.g., 1:30)\n• **HH:MM:SS** (e.g., 1:05:30)\n• **Seconds** (e.g., 90)",
                trackLength: "**Track length:** {length}"
            },
            success: {
                title: "## ⏩ Seeked to Position",
                time: "**Time:** {time}",
                track: "**Track:** [{title}]({uri})",
                message: "The track has been seeked to the specified time."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while seeking.\nPlease try again later."
            }
        },
        trackinfo: {
            command: {
                name: "trackinfo",
                description: "Show detailed information about the current track"
            },
            trackInfo: {
                title: "## Track Information",
                titleLabel: "**Title:** [{title}]({uri})",
                artist: "**Artist:** {artist}",
                duration: "**Duration:** {duration}",
                source: "**Source:** {source}"
            },
            progress: {
                title: "## Progress",
                current: "**Current:** {current}",
                total: "**Total:** {total}",
                progress: "**Progress:** {progress}%"
            },
            status: {
                title: "## 🎚️ Player Status",
                volume: "**Volume:** {volume}%",
                loop: "**Loop:** {loop}",
                status: "**Status:** {status}",
                queue: "**Queue:** {count} track{plural}"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while retrieving track information.\nPlease try again later."
            }
        },
        voteskip: {
            command: {
                name: "voteskip",
                description: "Vote to skip the current track"
            },
            alreadyVoted: {
                title: "## ❌ Already Voted",
                message: "You have already voted to skip this track.",
                votes: "**Current votes:** {current}/{required}"
            },
            success: {
                title: "## ✅ Vote Added",
                message: "Your vote has been added!",
                currentVotes: "**Current votes:** {current}/{required}",
                required: "**Required:** {required} votes to skip",
                moreNeeded: "{count} more vote{plural} needed."
            },
            skipped: {
                title: "## ⏭️ Track Skipped by Vote",
                message: "The track has been skipped!",
                votes: "**Votes:** {current}/{required}",
                required: "**Required:** {required} votes"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while processing the vote.\nPlease try again later."
            }
        },
        filters: {
            command: {
                name: "filters",
                description: "Control audio filters"
            },
            cleared: {
                title: "## ✅ Filters Cleared",
                message: "All audio filters have been cleared.",
                note: "The audio is now back to normal."
            },
            invalid: {
                title: "## ❌ Invalid Filter",
                message: "The selected filter is invalid.",
                note: "Please select a valid filter from the options."
            },
            success: {
                title: "## 🎛️ Filter Applied",
                filter: "**Filter:** {filter}",
                message: "The audio filter has been applied successfully.",
                note: "Use `/filters clear` to remove all filters."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while applying the filter.\nPlease try again later."
            }
        },
        play: {
            command: {
                name: "play",
                description: "Play a song from a name or link"
            },
            lavalinkManagerError: {
                title: "## ❌ Lavalink Manager Error",
                message: "Lavalink node manager is not initialized.",
                note: "Please contact the bot administrator."
            },
            noNodes: {
                title: "## ❌ No Lavalink Nodes",
                message: "No Lavalink nodes are currently available ({connected}/{total} connected).",
                note: "The bot is attempting to reconnect. Please try again in a moment."
            },
            spotifyError: {
                title: "## ❌ Spotify Error",
                message: "Failed to fetch Spotify data.",
                note: "Please check the link and try again."
            },
            invalidResponse: {
                title: "## ❌ Invalid Response",
                message: "Invalid response from the music source.",
                note: "Please try again or use a different query."
            },
            noResults: {
                title: "## ❌ No Results",
                message: "No results found for your query.",
                note: "Try a different search term or link."
            },
            success: {
                titleTrack: "## ✅ Track Added",
                titlePlaylist: "## ✅ Playlist Added",
                trackAdded: "Track has been added to the queue.",
                playlistAdded: "**{count}** tracks have been added to the queue.",
                nowPlaying: "🎵 Now playing...",
                queueReady: "⏸️ Queue ready"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while processing the request.\nPlease try again later."
            }
        },
        search: {
            command: {
                name: "search",
                description: "Search for a song and select from results"
            },
            lavalinkManagerError: {
                title: "## ❌ Lavalink Manager Error",
                message: "Lavalink node manager is not initialized.",
                note: "Please contact the bot administrator."
            },
            noNodes: {
                title: "## ❌ No Lavalink Nodes",
                message: "No Lavalink nodes are currently available ({connected}/{total} connected).",
                note: "The bot is attempting to reconnect. Please try again in a moment."
            },
            noResults: {
                title: "## ❌ No Results",
                message: "No results found for your search query.",
                note: "Try a different search term."
            },
            playlistNotSupported: {
                title: "## ❌ Playlists Not Supported",
                message: "Playlists are not supported in search.",
                note: "Use `/play` command for playlists."
            },
            results: {
                title: "## 🔍 Search Results",
                query: "**Query:** {query}",
                track: "**{number}.** [{title}]({uri})\n   └ {author} • {duration}"
            },
            buttons: {
                cancel: "Cancel"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while searching.\nPlease try again later."
            }
        },
        loop: {
            command: {
                name: "loop",
                description: "Set the loop mode for the current queue"
            },
            track: {
                title: "## 🔁 Track Loop Enabled",
                message: "The current track will now loop indefinitely.",
                note: "Use `/loop off` to disable looping."
            },
            queue: {
                title: "## 🔁 Queue Loop Enabled",
                message: "The entire queue will now loop.",
                note: "Use `/loop off` to disable looping."
            },
            off: {
                title: "## ❌ Loop Disabled",
                message: "Looping has been disabled.",
                note: "Tracks will play in order and stop when the queue ends."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while setting loop mode.\nPlease try again later."
            }
        },
        leave: {
            command: {
                name: "leave",
                description: "Make the bot leave the voice channel"
            },
            success: {
                title: "## 👋 Left Voice Channel",
                message: "The bot has left the voice channel.",
                note: "Use `/play` to start playing music again."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while leaving the voice channel.\nPlease try again later."
            }
        }
    },
    playlist: {
        createplaylist: {
            command: {
                name: "createplaylist",
                description: "Create a new playlist"
            },
            alreadyExists: {
                title: "## ❌ Playlist Already Exists",
                message: "A playlist with the name **\"{name}\"** already exists.",
                note: "Please choose a different name."
            },
            success: {
                title: "## ✅ Playlist Created",
                message: "Your playlist **\"{name}\"** has been created successfully!",
                visibility: "**Visibility:** {visibility}",
                server: "**Server:** {server}",
                private: "🔒 Private",
                public: "🌐 Public"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while creating the playlist.\nPlease try again later."
            }
        },
        addsong: {
            command: {
                name: "addsong",
                description: "Add a song to a playlist"
            },
            notFound: {
                title: "## ❌ Playlist Not Found",
                message: "The playlist **\"{name}\"** does not exist.",
                note: "Please check the playlist name and try again."
            },
            accessDenied: {
                title: "## 🔒 Access Denied",
                message: "You don't have permission to modify this playlist.",
                note: "Only the playlist owner can add songs."
            },
            success: {
                title: "## ✅ Song Added",
                song: "**Song:** {song}",
                playlist: "**Playlist:** {playlist}",
                message: "The song has been successfully added to your playlist!"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while adding the song.\nPlease try again later."
            }
        },
        deleteplaylist: {
            command: {
                name: "deleteplaylist",
                description: "Delete a playlist"
            },
            notFound: {
                title: "## ❌ Playlist Not Found",
                message: "The playlist **\"{name}\"** does not exist.",
                note: "Please check the playlist name and try again."
            },
            accessDenied: {
                title: "## 🔒 Access Denied",
                message: "You don't have permission to delete this playlist.",
                note: "Only the playlist owner can delete it."
            },
            success: {
                title: "## ✅ Playlist Deleted",
                message: "The playlist **\"{name}\"** has been successfully deleted."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while deleting the playlist.\nPlease try again later."
            }
        },
        deletesong: {
            command: {
                name: "deletesong",
                description: "Delete a song from a playlist"
            },
            notFound: {
                title: "## ❌ Playlist Not Found",
                message: "The playlist **\"{name}\"** does not exist.",
                note: "Please check the playlist name and try again."
            },
            success: {
                title: "## ✅ Song Deleted",
                song: "**Song:** {song}",
                playlist: "**Playlist:** {playlist}",
                message: "The song has been successfully removed from your playlist."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while deleting the song.\nPlease try again later."
            }
        },
        savequeue: {
            command: {
                name: "savequeue",
                description: "Save the current queue as a playlist"
            },
            queueEmpty: {
                title: "## ❌ Queue Empty",
                message: "The queue is empty. Nothing to save.",
                note: "Add some songs to the queue first!"
            },
            alreadyExists: {
                title: "## ❌ Playlist Already Exists",
                message: "A playlist named **\"{name}\"** already exists.",
                note: "Please choose a different name."
            },
            success: {
                title: "## ✅ Queue Saved!",
                message: "Queue saved as playlist **\"{name}\"**",
                tracks: "**Tracks:** {count}"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while saving the queue.\nPlease try again later."
            }
        },
        myplaylists: {
            command: {
                name: "myplaylists",
                description: "List all playlists you have created"
            },
            noPlaylists: {
                title: "## 📋 No Playlists Found",
                message: "You haven't created any playlists yet.",
                note: "Use `/createplaylist` to create your first playlist!"
            },
            title: "## 📂 Your Playlists (Page {currentPage}/{totalPages})",
            playlistItem: "**{number}.** **{name}**\n   • Visibility: **{visibility}**\n   • Server: {server}\n   • Songs: **{count}**",
            visibilityPrivate: "🔒 Private",
            visibilityPublic: "🌐 Public",
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while fetching your playlists.\nPlease try again later."
            }
        },
        allplaylists: {
            command: {
                name: "allplaylists",
                description: "List all public playlists"
            },
            noPlaylists: {
                title: "## 📋 No Public Playlists Found",
                message: "There are no public playlists available.",
                note: "Create a public playlist using `/createplaylist`!"
            },
            title: "## 🌐 Public Playlists (Page {currentPage}/{totalPages})",
            playlistItem: "**{number}.** **{name}**\n   • Created by: {creator}\n   • Server: {server}\n   • Songs: **{count}**",
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while fetching public playlists.\nPlease try again later."
            }
        },
        showsongs: {
            command: {
                name: "showsongs",
                description: "Show all songs in a playlist"
            },
            notFound: {
                title: "## ❌ Playlist Not Found",
                message: "The playlist **\"{name}\"** does not exist.",
                note: "Please check the playlist name and try again."
            },
            accessDenied: {
                title: "## 🔒 Access Denied",
                message: "You don't have permission to view this playlist.",
                note: "This playlist is private and only the owner can view it."
            },
            empty: {
                title: "## 📋 Songs in \"{name}\"",
                message: "This playlist is empty. Add songs using `/addsong`!"
            },
            title: "## Songs in \"{name}\" (Page {currentPage}/{totalPages})",
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while showing playlist songs.\nPlease try again later."
            }
        },
        playcustomplaylist: {
            command: {
                name: "playcustomplaylist",
                description: "Play a custom playlist"
            },
            notFound: {
                title: "## ❌ Playlist Not Found",
                message: "The playlist **\"{name}\"** does not exist.",
                note: "Please check the playlist name and try again."
            },
            accessDenied: {
                title: "## 🔒 Access Denied",
                message: "You don't have permission to play this playlist.",
                note: "This playlist is private and only the owner can play it."
            },
            empty: {
                title: "## ❌ Empty Playlist",
                message: "The playlist **\"{name}\"** is empty.",
                note: "Add some songs to the playlist first!"
            },
            lavalinkManagerError: {
                title: "## ❌ Lavalink Manager Error",
                message: "Lavalink node manager is not initialized.",
                note: "Please contact the bot administrator."
            },
            noNodes: {
                title: "## ❌ No Lavalink Nodes",
                message: "No Lavalink nodes are currently available ({connected}/{total} connected).",
                note: "The bot is attempting to reconnect. Please try again in a moment."
            },
            resolveError: {
                title: "## ❌ Error Resolving Song",
                message: "Failed to resolve one or more songs from the playlist.",
                note: "Please check the playlist and try again."
            },
            success: {
                title: "## Playing Playlist",
                message: "Now playing playlist **\"{name}\"**",
                songs: "**Songs:** {count}"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while playing the playlist.\nPlease try again later."
            }
        }
    },
    utility: {
        twentyfourseven: {
            command: {
                name: "247",
                description: "Toggle 24/7 mode (keep bot in voice channel)"
            },
            accessDenied: {
                title: "## ❌ Access Denied",
                message: "Only the server owner can toggle 24/7 mode."
            },
            enabled: {
                title: "## ✅ 24/7 Mode Enabled",
                message: "24/7 mode has been **enabled** for this server.",
                note: "🔄 The bot will stay in the voice channel even when the queue is empty."
            },
            disabled: {
                title: "## ❌ 24/7 Mode Disabled",
                message: "24/7 mode has been **disabled** for this server.",
                note: "⏹️ The bot will leave the voice channel when the queue ends."
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while updating 24/7 mode.",
                note: "Please try again later."
            }
        },
        history: {
            command: {
                name: "history",
                description: "Show recently played tracks"
            },
            noHistory: {
                title: "## 📜 No History Found",
                message: "No playback history found for this server.",
                note: "Play some songs to build up your history!"
            },
            title: "## 📜 Playback History",
            titlePaginated: "## 📜 Playback History (Page {currentPage}/{totalPages})",
            noMoreSongs: "- No more songs in history.",
            buttons: {
                previous: "Previous",
                next: "Next"
            },
            errors: {
                title: "## ❌ Error",
                message: "An error occurred while retrieving history.",
                note: "Please try again later."
            }
        }
    },
    events: {
        interactionCreate: {
            noGuild: "❌ **This command can only be used in a server.**",
            commandNotFound: "❌ **Command not found!**",
            noPermission: "❌ **You don't have permission to use this command.**",
            rateLimited: "⏳ **You're doing that too fast!**\nPlease wait **{seconds}** second(s) before using another command.",
            errorOccurred: "❌ **An error occurred: {message}**",
            unexpectedError: "❌ **An unexpected error occurred. Please try again later.**",
            errorTryAgain: "❌ An error occurred. Please try again."
        }
    },
    utils: {
        voiceChannelCheck: {
            noVoiceChannel: {
                title: "## ❌ No Voice Channel",
                message: "You need to be in a voice channel to use this command.",
                note: "Please join a voice channel and try again."
            },
            wrongChannel: {
                title: "## Join Voice Channel",
                message: "The bot is currently active in **{channelName}**.",
                note: "Please join **{channelName}** to use music commands."
            }
        },
        playerValidation: {
            queueEmpty: {
                title: "## ❌ Queue Empty",
                message: "The queue is empty. There are no songs available.",
                note: "Add some songs to the queue first using `/play`."
            },
            noSongPlaying: {
                title: "## ❌ No Song Playing",
                message: "No song is currently playing.",
                note: "Use `/play` to start playing music."
            },
            noMusicPlaying: {
                title: "## ❌ No Music Playing",
                message: "There is no music currently playing and the queue is empty.",
                note: "Use `/play` to start playing music."
            }
        },
        responseHandler: {
            defaultError: {
                title: "## ❌ Error",
                message: "An error occurred while processing the command.",
                note: "Please try again later."
            },
            commandError: "❌ An error occurred while processing the {commandName} command."
        }
    },
    console: {
        bot: {
            clientLogged: "Client logged as {tag}",
            musicSystemReady: "Riffy Music System Ready 🎵",
            lavalinkError: "Error initializing player: {message}",
            nodeManagerStatus: "Node Manager: {available}/{total} nodes available",
            nodeStatus: "Node Status:",
            nodeInfo: "{icon} {name} ({host}:{port}) - {status}{error}",
            commandsLoaded: "Total Commands Loaded: {count}",
            commandLoadFailed: "Failed to load: {name} - Missing data or run property",
            commandLoadError: "Error loading {name}: {message}",
            tokenVerification: "🔐 TOKEN VERIFICATION",
            tokenAuthFailed: "Authentication Failed ❌",
            tokenError: "Error: Turn On Intents or Reset New Token",
            databaseOnline: "Database Online ✅",
            databaseStatus: "🕸️  DATABASE STATUS",
            databaseConnection: "🕸️  DATABASE CONNECTION",
            databaseFailed: "Connection Failed ❌",
            databaseError: "Error: {message}",
            unhandledRejection: "Unhandled Rejection:",
            uncaughtException: "Uncaught Exception:",
            riffyThumbnailError: "[ Riffy ] Ignoring thumbnail error: {message}"
        },
        events: {
            rest: {
                commandsRegistered: "Successfully registered {count} application (/) commands globally ✅",
                commandsFailed: "Failed to register commands ❌",
                error: "Error: {message}",
                details: "Details: {details}"
            },
            interaction: {
                commandNotFound: "Command not found: {commandName}",
                errorExecuting: "Error executing command {commandName}:",
                errorHelpButton: "Error handling help back button:",
                errorHelpSelect: "Error handling help category select:",
                unexpectedError: "Unexpected error:",
                failedToSendError: "Failed to send error message:"
            }
        },
        database: {
            uriNotDefined: "Database URI is not defined in the configuration.",
            skippingConnection: "Skipping database connection as URI is not provided.",
            connected: "Connected to Database ✅",
            connectionFailed: "Could not connect to database. Continuing without database functionality."
        },
        lavalink: {
            nodesConfigured: "Nodes configured: {count}",
            riffyInitialized: "Initialized with {count} node(s)",
            nodeKeys: "Node keys:",
            failedToInitialize: "Failed to initialize Riffy: {message}",
            riffyReinitialized: "Riffy re-initialized",
            failedToReinitialize: "Failed to re-initialize Riffy: {message}",
            nodeConnected: "Connected: {name} ({host}:{port}) • {available}/{total} up",
            nodeDisconnected: "Disconnected: {name} ({host}:{port}) • {available}/{total} up",
            retryLimitReported: "Retry limit reported by {name}; reconnect loop continues",
            nodeError: "Error: {name} ({host}:{port}) • {message}",
            nodeStatus: "{available}/{total} up",
            waitingForConnection: "Waiting for Lavalink node connection...",
            nodeAvailable: "Node available ({count} connected)",
            noNodesConnected: "No nodes connected ({connected}/{total}) — attempting reconnect...",
            nodeStatusReport: "Node Status: {connected}/{total} connected"
        },
        player: {
            lacksPermissions: "Bot lacks necessary permissions to send messages in this channel.",
            errorSendingMessage: "Error sending message: {message}",
            trackException: "Track Exception for guild {guildId}: {message}",
            trackStuck: "Track Stuck for guild {guildId}: {message}",
            trackNull: "Track is null or missing info for guild {guildId} - ignoring event",
            playerInvalid: "Player invalid or destroyed for guild {guildId} - ignoring event",
            channelNotFound: "Channel not found for guild {guildId}",
            errorSavingHistory: "Error saving to history:",
            errorMusicCard: "Error creating or sending music card: {message}",
            autoplayDisabled: "Autoplay is disabled for guild: {guildId}",
            errorQueueEnd: "Error handling queue end:",
            errorCleanupPrevious: "Error cleaning up previous track message:",
            errorCleanupTrack: "Error cleaning up track message:",
            lyricsFetchError: "❌ Lyrics fetch error: {message}",
            unableToSendMessage: {
                title: "## ⚠️ Unable to Send Message",
                message: "Unable to send message. Check bot permissions."
            },
            trackError: {
                title: "## ⚠️ Track Error",
                message: "Failed to load the track.",
                skipping: "Skipping to next song..."
            },
            unableToLoadCard: {
                title: "## ⚠️ Unable to Load Track Card",
                message: "Unable to load track card. Continuing playback..."
            },
            queueEnd: {
                noMoreAutoplay: "⚠️ **No more tracks to autoplay. Disconnecting...**",
                queueEndedAutoplayDisabled: "🎶 **Queue has ended. Autoplay is disabled.**",
                queueEmpty: "👾 **Queue Empty! Disconnecting...**",
                twentyfoursevenEmpty: "🔄 **24/7 Mode: Bot will stay in voice channel. Queue is empty.**"
            },
            voiceChannelRequired: {
                title: "## 🔒 Voice Channel Required",
                message: "You need to be in the same voice channel to use the controls!"
            },
            controls: {
                skip: "⏭️ **Skipping to next song...**",
                queueCleared: "🗑️ **Queue has been cleared!**",
                playbackStopped: "⏹️ **Playback has been stopped and player destroyed!**",
                alreadyPaused: "⏸️ **Playback is already paused!**",
                playbackPaused: "⏸️ **Playback has been paused!**",
                alreadyResumed: "▶️ **Playback is already resumed!**",
                playbackResumed: "▶️ **Playback has been resumed!**",
                volumeMax: "🔊 **Volume is already at maximum!**",
                volumeMin: "🔉 **Volume is already at minimum!**",
                volumeChanged: "🔊 **Volume changed to {volume}%!**",
                trackLoopActivated: "🔁 **Track loop is activated!**",
                queueLoopActivated: "🔁 **Queue loop is activated!**",
                loopDisabled: "❌ **Loop is disabled!**"
            },
            lyrics: {
                noSongPlaying: "🚫 **No song is currently playing.**",
                notFound: "❌ **Lyrics not found!**",
                liveTitle: "## Live Lyrics: {title}",
                syncing: "🔄 Syncing lyrics...",
                fullTitle: "## Full Lyrics: {title}",
                stopButton: "Stop Lyrics",
                fullButton: "Full Lyrics",
                deleteButton: "Delete"
            },
            trackInfo: {
                title: "**Title:**",
                author: "**Author:**",
                length: "**Length:**",
                requester: "**Requester:**",
                source: "**Source:**",
                progress: "**Progress:**",
                unknownArtist: "Unknown Artist",
                unknown: "Unknown"
            },
            controlLabels: {
                loop: "Loop",
                disable: "Disable",
                skip: "Skip",
                queue: "Queue",
                clear: "Clear",
                stop: "Stop",
                pause: "Pause",
                resume: "Resume",
                volUp: "Vol +",
                volDown: "Vol -"
            }
        }
    }
};
export default lang;