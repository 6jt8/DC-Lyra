const lang: Record<string, any> = {
    meta: {
        name: "Русский",
        code: "ru"
    },
    help: {
        command: {
            name: "help",
            description: "Получить информацию о боте и его командах",
            category: {
                name: "category",
                description: "Выберите категорию для просмотра",
                choices: {
                    main: "🏠 Главное меню",
                    music: "🎵 Музыкальные команды",
                    playlist: "📋 Команды плейлиста",
                    basic: "💜 Основные команды",
                    utility: "🔧 Утилиты"
                }
            }
        },
        categories: {
            main: {
                name: "Главное меню",
                emoji: "🏠",
                description: "Добро пожаловать в меню помощи"
            },
            music: {
                name: "Музыкальные команды",
                emoji: "🎵",
                description: "Управление воспроизведением музыки и настройками"
            },
            playlist: {
                name: "Команды плейлиста",
                emoji: "📋",
                description: "Управление вашими плейлистами"
            },
            basic: {
                name: "Основные команды",
                emoji: "⚙️",
                description: "Общая информация о боте и утилиты"
            },
            utility: {
                name: "Утилиты",
                emoji: "🔧",
                description: "Дополнительные функции утилит"
            }
        },
        mainMenu: {
            header: {
                title: "# 🎵 {botName} Меню помощи",
                welcome: "**Добро пожаловать в {botName}!**",
                subtitle: "Ваш идеальный музыкальный компаньон в Discord."
            },
            statistics: {
                title: "## Статистика",
                commands: "• **Команд:** {totalCommands}",
                servers: "• **Серверов:** {totalServers}",
                users: "• **Пользователей:** {totalUsers}",
                uptime: "• **Время работы:** {uptimeString}",
                ping: "• **Пинг:** {ping}ms"
            },
            categories: {
                title: "## 📂 Доступные категории",
                music: "{emoji} **{name}** - {count} команд",
                playlist: "{emoji} **{name}** - {count} команд",
                basic: "{emoji} **{name}** - {count} команд",
                utility: "{emoji} **{name}** - {count} команд",
                footer: "**Выберите категорию ниже для просмотра подробных команд.**"
            },
            footer: { version: "**{botName}**", developer: "" },
            selectMenu: {
                placeholder: "📂 Выберите категорию для просмотра команд...",
                musicDescription: "{count} команд доступно",
                playlistDescription: "{count} команд доступно",
                basicDescription: "{count} команд доступно",
                utilityDescription: "{count} команд доступно"
            },
            buttons: {
                supportServer: "Сервер поддержки",
                github: "GitHub"
            }
        },
        categoryPage: {
            noCommands: {
                title: "## ❌ Команды не найдены",
                message: "В категории **{categoryName}** нет доступных команд.",
                backToHelp: "Используйте `/help` для возврата в главное меню."
            },
            header: {
                title: "# {emoji} {categoryName}",
                description: "{description}",
                count: "**{count}** команд{plural} доступно"
            },
            commands: {
                title: "## Команды",
                titlePaginated: "## Команды (Страница {currentPage}/{totalPages})",
                item: "**{num}.** `/{commandName}`\\n   {description}",
                noDescription: "Описание недоступно."
            },
            footer: { version: "**{botName}**", developer: "" },
            buttons: {
                backToMain: "🏠 Вернуться в главное меню",
                supportServer: "Сервер поддержки",
                github: "GitHub"
            }
        },
        errors: {
            general: "❌ **Произошла ошибка при получении меню помощи.**",
            fallback: "❌ Произошла ошибка при получении меню помощи.",
            fallbackDetails: "**Бот:** {botName}\\n**Команд:** {totalCommands}\\n**Серверов:** {totalServers}\\n**Поддержка:** {supportServer}"
        }
    },
    language: {
        command: {
            name: "language",
            description: "Установить язык бота для этого сервера",
            option: {
                name: "lang",
                description: "Выберите язык"
            }
        },
        current: {
            title: "🌐 Текущий язык",
            description: "Текущий язык для этого сервера: **{language}**",
            global: "Глобальный по умолчанию (из конфигурации): **{language}**"
        },
        changed: {
            title: "✅ Язык изменён",
            description: "Язык сервера изменён на: **{language}**",
            note: "Бот теперь будет использовать этот язык для всех команд на этом сервере."
        },
        available: {
            title: "📚 Доступные языки",
            description: "Выберите язык из списка ниже:",
            list: "**Доступные языки:**\\n{list}",
            item: "• **{name}** (`{code}`)"
        },
        errors: {
            notFound: "❌ **Язык не найден!**\\nЯзык `{code}` не существует.",
            failed: "❌ **Не удалось установить язык!**\\n{error}",
            noPermission: "❌ **У вас нет разрешения на изменение языка!**\\nВам нужно разрешение `Управление сервером`."
        },
        info: {
            title: "ℹ️ Информация о языке",
            description: "**Текущий язык сервера:** {serverLang}\\n**Глобальный язык по умолчанию:** {globalLang}\\n\\n**Доступные языки:** {count}",
            reset: "Чтобы сбросить на глобальный по умолчанию, используйте `/language reset`"
        }
    },
    ping: {
        command: {
            name: "ping",
            description: "Проверить задержку и время отклика бота"
        },
        header: {
            title: "# Задержка бота",
            botName: "**{botName}** - Lyra музыкальный бот",
            subtitle: "Проверьте время отклика и статус соединения бота"
        },
        metrics: {
            title: "## Метрики производительности",
            responseTime: "**Время отклика:** {latency}ms",
            websocketPing: "**Пинг Websocket:** {ping}ms",
            botUptime: "**Время работы бота:** {uptime}",
            connectionSpeed: {
                excellent: "🟢 Отличная скорость соединения",
                good: "🟡 Хорошая скорость соединения",
                slow: "🔴 Медленная скорость соединения"
            }
        },
        footer: { version: "**{botName}**", developer: "" },
        errors: {
            title: "## ❌ Ошибка",
            message: "Произошла ошибка при проверке задержки.\\nПожалуйста, попробуйте позже.",
            fallback: "❌ Произошла ошибка при проверке задержки."
        }
    },
    stats: {
        command: {
            name: "stats",
            description: "Показать статистику бота и информацию о сервере"
        },
        header: {
            title: "# Статистика бота",
            botName: "**{botName}** - Lyra музыкальный бот",
            developer: "Разработано ShadowBlack / https://github.com/Shadow-Black-YT"
        },
        botInfo: {
            title: "## Информация о боте",
            servers: "• **Серверов:** {count}",
            users: "• **Пользователей:** {count}",
            channels: "• **Каналов:** {count}",
            uptime: "• **Время работы:** {uptime}"
        },
        musicStats: {
            title: "## Музыкальная статистика",
            activePlayers: "• **Активных плееров:** {count}",
            totalPlayers: "• **Всего плееров:** {count}",
            currentTrack: "• **Текущий трек:** {track}"
        },
        systemInfo: {
            title: "## Информация о системе",
            cpu: "• **CPU:** {cpu}",
            platform: "• **Платформа:** {platform}",
            nodejs: "• **Node.js:** {version}",
            discordjs: "• **Discord.js:** {version}"
        },
        memory: {
            title: "## Память и производительность",
            memoryUsage: "**Использование памяти:**",
            used: "• Использовано: {used}",
            total: "• Всего: {total}",
            systemMemory: "**Системная память:**",
            systemUsed: "• Использовано: {used}",
            systemFree: "• Свободно: {free}",
            performance: "**Производительность:**",
            ping: "• Пинг: {ping}ms",
            shards: "• Шарды: {count}",
            commands: "• Команд: {count}"
        },
        footer: { version: "**{botName}**", developer: "" },
        errors: {
            title: "## ❌ Ошибка",
            message: "Произошла ошибка при получении статистики.\\nПожалуйста, попробуйте позже.",
            fallback: "❌ Произошла ошибка при получении статистики."
        }
    },
    support: {
        command: {
            name: "support",
            description: "Получить ссылку на сервер поддержки и важные ссылки"
        },
        header: {
            title: "# Поддержка и ссылки",
            botName: "**{botName}** - Lyra музыкальный бот",
            subtitle: "Получите помощь, сообщите о проблемах или свяжитесь с нами!"
        },
        links: {
            title: "## Важные ссылки",
            supportServer: {
                title: "**Сервер поддержки**",
                description: "Присоединяйтесь к нашему Discord серверу для помощи, обновлений и сообщества!",
                link: "[Нажмите здесь, чтобы присоединиться]({url})"
            },
            github: {
                title: "**GitHub**",
                description: "Посмотрите наш код и внесите свой вклад!",
                link: "[Посетить GitHub]({url})"
            },
            youtube: {
                title: "**YouTube**",
                description: "Смотрите уроки и обновления!",
                link: "[Подписаться]({url})"
            },
            website: {
                title: "**Веб-сайт**",
                description: "Посетите наш официальный веб-сайт!",
                link: "[Посетить веб-сайт]({url})"
            }
        },
        footer: { version: "**{botName}**", developer: "" },
        buttons: {
            supportServer: "Сервер поддержки",
            github: "GitHub",
            youtube: "YouTube"
        },
        errors: {
            title: "## ❌ Ошибка",
            message: "Произошла ошибка при получении информации о поддержке.\\nПожалуйста, попробуйте позже.",
            fallback: "❌ Произошла ошибка при получении информации о поддержке."
        }
    },
    music: {
        autoplay: {
            command: {
                name: "autoplay",
                description: "Переключить автовоспроизведение для сервера"
            },
            enabled: {
                title: "## ✅ Автовоспроизведение включено",
                message: "Автовоспроизведение было **включено** для этого сервера.",
                note: "🎵 Бот будет автоматически воспроизводить похожие песни, когда очередь закончится."
            },
            disabled: {
                title: "## ❌ Автовоспроизведение отключено",
                message: "Автовоспроизведение было **отключено** для этого сервера.",
                note: "⏹️ Бот остановит воспроизведение, когда очередь закончится."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при обновлении настроек автовоспроизведения.\\nПожалуйста, попробуйте позже."
            }
        },
        pause: {
            command: {
                name: "pause",
                description: "Приостановить текущую песню"
            },
            success: {
                title: "## ⏸️ Музыка приостановлена",
                message: "Текущий трек был приостановлен.",
                note: "Используйте `/resume` для продолжения воспроизведения."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при приостановке музыки.\\nПожалуйста, попробуйте позже."
            }
        },
        resume: {
            command: {
                name: "resume",
                description: "Возобновить текущую песню"
            },
            success: {
                title: "## ▶️ Музыка возобновлена",
                message: "Текущий трек был возобновлён.",
                note: "Музыка сейчас воспроизводится."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при возобновлении музыки.\\nПожалуйста, попробуйте позже."
            }
        },
        skip: {
            command: {
                name: "skip",
                description: "Пропустить текущую песню"
            },
            success: {
                title: "## ⏭️ Песня пропущена",
                message: "Текущий трек был пропущен.",
                nextSong: "Воспроизведение следующей песни в очереди...",
                queueEmpty: "Очередь пуста."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при пропуске песни.\\nПожалуйста, попробуйте позже."
            }
        },
        clear: {
            command: {
                name: "clear",
                description: "Очистить всю очередь"
            },
            success: {
                title: "## 🗑️ Очередь очищена",
                message: "Успешно удалено **{count}** песен{plural} из очереди.",
                note: "Текущая воспроизводимая песня продолжится."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при очистке очереди.\\nПожалуйста, попробуйте позже."
            }
        },
        stop: {
            command: {
                name: "stop",
                description: "Остановить текущую песню и уничтожить плеер"
            },
            success: {
                title: "## ⏹️ Музыка остановлена",
                message24_7: "Музыка остановлена. Плеер остаётся активным (режим 24/7 включён).",
                messageNormal: "Музыка была остановлена, и плеер был уничтожен.",
                note: "Используйте `/play` для начала воспроизведения музыки снова."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при остановке музыки.\\nПожалуйста, попробуйте позже."
            }
        },
        volume: {
            command: {
                name: "volume",
                description: "Установить громкость текущей песни"
            },
            invalid: {
                title: "## ❌ Неверная громкость",
                message: "Громкость должна быть между **0** и **100**.",
                note: "Пожалуйста, укажите правильный уровень громкости."
            },
            success: {
                title: "## 🔊 Громкость обновлена",
                message: "Громкость установлена на **{volume}%**.",
                muted: "🔇 Без звука",
                low: "🔉 Низкая",
                medium: "🔊 Средняя",
                high: "🔊🔊 Высокая"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при установке громкости.\\nПожалуйста, попробуйте позже."
            }
        },
        shuffle: {
            command: {
                name: "shuffle",
                description: "Перемешать текущую очередь песен"
            },
            queueEmpty: {
                title: "## ❌ Очередь пуста",
                message: "Очередь пуста. Нет песен для перемешивания.",
                note: "Сначала добавьте песни в очередь, используя `/play`."
            },
            success: {
                title: "## 🔀 Очередь перемешана",
                message: "Очередь была успешно перемешана!",
                count: "**{count}** песен{plural} были переставлены."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при перемешивании очереди.\\nПожалуйста, попробуйте позже."
            }
        },
        np: {
            command: {
                name: "np",
                description: "Отображает текущую воспроизводимую песню с индикатором прогресса"
            },
            title: "## Сейчас играет",
            nowPlaying: "**[{title}]({uri})**",
            by: "исполнитель: **{author}**",
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при получении текущего трека.\\nПожалуйста, попробуйте позже."
            }
        },
        queue: {
            command: {
                name: "queue",
                description: "Показать текущую очередь песен"
            },
            title: "## 📋 Текущая очередь",
            titlePaginated: "## 📋 Текущая очередь (Страница {currentPage}/{totalPages})",
            nowPlaying: "🎵 **Сейчас играет:**",
            track: "[{title}]({uri})",
            requestedBy: "Запросил: {requester}",
            trackNumber: "**{number}.**",
            noMoreSongs: "Больше нет песен",
            buttons: {
                previous: "Назад",
                next: "Вперёд"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при получении очереди.\\nПожалуйста, попробуйте позже."
            }
        },
        remove: {
            command: {
                name: "remove",
                description: "Удалить песню из очереди по её позиции"
            },
            queueEmpty: {
                title: "## ❌ Очередь пуста",
                message: "Очередь пуста. Нет песен для удаления.",
                note: "Сначала добавьте песни в очередь, используя `/play`."
            },
            invalidPosition: {
                title: "## ❌ Неверная позиция",
                message: "Позиция должна быть между **1** и **{max}**.",
                note: "В очереди **{count}** песен{plural}."
            },
            success: {
                title: "## ✅ Песня удалена",
                removed: "**Удалено:** [{title}]({uri})",
                position: "**Позиция:** {position}",
                message: "Песня была удалена из очереди."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при удалении песни.\\nПожалуйста, попробуйте позже."
            }
        },
        move: {
            command: {
                name: "move",
                description: "Переместить трек на другую позицию в очереди"
            },
            queueEmpty: {
                title: "## ❌ Очередь пуста",
                message: "Очередь пуста. Нет песен для перемещения.",
                note: "Сначала добавьте песни в очередь, используя `/play`."
            },
            invalidPosition: {
                title: "## ❌ Неверная позиция",
                message: "Позиция должна быть между **1** и **{max}**.",
                note: "В очереди **{count}** песен{plural}."
            },
            samePosition: {
                title: "## ❌ Одинаковая позиция",
                message: "Позиции откуда и куда не могут быть одинаковыми.",
                note: "Пожалуйста, укажите разные позиции."
            },
            success: {
                title: "## ✅ Трек перемещён",
                track: "**Трек:** [{title}]({uri})",
                from: "**С позиции:** {from}",
                to: "**На позицию:** {to}",
                message: "Трек был успешно перемещён."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при перемещении трека.\\nПожалуйста, попробуйте позже."
            }
        },
        jump: {
            command: {
                name: "jump",
                description: "Перейти к определённому треку в очереди"
            },
            queueEmpty: {
                title: "## ❌ Очередь пуста",
                message: "Очередь пуста. Нет песен для перехода.",
                note: "Сначала добавьте песни в очередь, используя `/play`."
            },
            invalidPosition: {
                title: "## ❌ Неверная позиция",
                message: "Позиция должна быть между **1** и **{max}**.",
                note: "В очереди **{count}** песен{plural}."
            },
            success: {
                title: "## ⏭️ Переход к треку",
                track: "**Трек:** [{title}]({uri})",
                position: "**Позиция:** {position}",
                message: "Переход к указанному треку в очереди выполнен."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при переходе к треку.\\nПожалуйста, попробуйте позже."
            }
        },
        seek: {
            command: {
                name: "seek",
                description: "Перемотать на определённое время в текущем треке"
            },
            invalidTime: {
                title: "## ❌ Неверное время",
                message: "Неверный формат времени. Используйте один из следующих:",
                formats: "• **MM:SS** (например, 1:30)\\n• **HH:MM:SS** (например, 1:05:30)\\n• **Секунды** (например, 90)",
                trackLength: "**Длительность трека:** {length}"
            },
            success: {
                title: "## ⏩ Перемотка на позицию",
                time: "**Время:** {time}",
                track: "**Трек:** [{title}]({uri})",
                message: "Трек был перемотан на указанное время."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при перемотке.\\nПожалуйста, попробуйте позже."
            }
        },
        trackinfo: {
            command: {
                name: "trackinfo",
                description: "Показать подробную информацию о текущем треке"
            },
            trackInfo: {
                title: "## Информация о треке",
                titleLabel: "**Название:** [{title}]({uri})",
                artist: "**Исполнитель:** {artist}",
                duration: "**Длительность:** {duration}",
                source: "**Источник:** {source}"
            },
            progress: {
                title: "## Прогресс",
                current: "**Текущее:** {current}",
                total: "**Всего:** {total}",
                progress: "**Прогресс:** {progress}%"
            },
            status: {
                title: "## 🎚️ Статус плеера",
                volume: "**Громкость:** {volume}%",
                loop: "**Повтор:** {loop}",
                status: "**Статус:** {status}",
                queue: "**Очередь:** {count} трек{plural}"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при получении информации о треке.\\nПожалуйста, попробуйте позже."
            }
        },
        voteskip: {
            command: {
                name: "voteskip",
                description: "Проголосовать за пропуск текущего трека"
            },
            alreadyVoted: {
                title: "## ❌ Уже проголосовали",
                message: "Вы уже проголосовали за пропуск этого трека.",
                votes: "**Текущие голоса:** {current}/{required}"
            },
            success: {
                title: "## ✅ Голос добавлен",
                message: "Ваш голос был добавлен!",
                currentVotes: "**Текущие голоса:** {current}/{required}",
                required: "**Требуется:** {required} голосов для пропуска",
                moreNeeded: "Нужно ещё {count} голос{plural}."
            },
            skipped: {
                title: "## ⏭️ Трек пропущен по голосованию",
                message: "Трек был пропущен!",
                votes: "**Голоса:** {current}/{required}",
                required: "**Требовалось:** {required} голосов"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при обработке голосования.\\nПожалуйста, попробуйте позже."
            }
        },
        filters: {
            command: {
                name: "filters",
                description: "Управление аудио фильтрами"
            },
            cleared: {
                title: "## ✅ Фильтры очищены",
                message: "Все аудио фильтры были очищены.",
                note: "Аудио теперь вернулось к нормальному."
            },
            invalid: {
                title: "## ❌ Неверный фильтр",
                message: "Выбранный фильтр недействителен.",
                note: "Пожалуйста, выберите правильный фильтр из опций."
            },
            success: {
                title: "## 🎛️ Фильтр применён",
                filter: "**Фильтр:** {filter}",
                message: "Аудио фильтр был успешно применён.",
                note: "Используйте `/filters clear` для удаления всех фильтров."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при применении фильтра.\\nПожалуйста, попробуйте позже."
            }
        },
        play: {
            command: {
                name: "play",
                description: "Воспроизвести песню по названию или ссылке"
            },
            lavalinkManagerError: {
                title: "## ❌ Ошибка менеджера Lavalink",
                message: "Менеджер узлов Lavalink не инициализирован.",
                note: "Пожалуйста, свяжитесь с администратором бота."
            },
            noNodes: {
                title: "## ❌ Нет узлов Lavalink",
                message: "В настоящее время нет доступных узлов Lavalink ({connected}/{total} подключено).",
                note: "Бот пытается переподключиться. Пожалуйста, попробуйте через мгновение."
            },
            spotifyError: {
                title: "## ❌ Ошибка Spotify",
                message: "Не удалось получить данные Spotify.",
                note: "Пожалуйста, проверьте ссылку и попробуйте снова."
            },
            invalidResponse: {
                title: "## ❌ Неверный ответ",
                message: "Неверный ответ от источника музыки.",
                note: "Пожалуйста, попробуйте снова или используйте другой запрос."
            },
            noResults: {
                title: "## ❌ Нет результатов",
                message: "По вашему запросу не найдено результатов.",
                note: "Попробуйте другой поисковый запрос или ссылку."
            },
            success: {
                titleTrack: "## ✅ Трек добавлен",
                titlePlaylist: "## ✅ Плейлист добавлен",
                trackAdded: "Трек был добавлен в очередь.",
                playlistAdded: "**{count}** треков было добавлено в очередь.",
                nowPlaying: "🎵 Сейчас играет...",
                queueReady: "⏸️ Очередь готова"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при обработке запроса.\\nПожалуйста, попробуйте позже."
            }
        },
        search: {
            command: {
                name: "search",
                description: "Искать песню и выбрать из результатов"
            },
            lavalinkManagerError: {
                title: "## ❌ Ошибка менеджера Lavalink",
                message: "Менеджер узлов Lavalink не инициализирован.",
                note: "Пожалуйста, свяжитесь с администратором бота."
            },
            noNodes: {
                title: "## ❌ Нет узлов Lavalink",
                message: "В настоящее время нет доступных узлов Lavalink ({connected}/{total} подключено).",
                note: "Бот пытается переподключиться. Пожалуйста, попробуйте через мгновение."
            },
            noResults: {
                title: "## ❌ Нет результатов",
                message: "По вашему поисковому запросу не найдено результатов.",
                note: "Попробуйте другой поисковый запрос."
            },
            playlistNotSupported: {
                title: "## ❌ Плейлисты не поддерживаются",
                message: "Плейлисты не поддерживаются в поиске.",
                note: "Используйте команду `/play` для плейлистов."
            },
            results: {
                title: "## 🔍 Результаты поиска",
                query: "**Запрос:** {query}",
                track: "**{number}.** [{title}]({uri})\\n   └ {author} • {duration}"
            },
            buttons: {
                cancel: "Отмена"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при поиске.\nПожалуйста, попробуйте позже."
            }
        },
        loop: {
            command: {
                name: "loop",
                description: "Установить режим повтора для текущей очереди"
            },
            track: {
                title: "## 🔁 Повтор Трека Включён",
                message: "Текущий трек будет повторяться бесконечно.",
                note: "Используй `/loop off` для отключения."
            },
            queue: {
                title: "## 🔁 Повтор Очереди Включён",
                message: "Вся очередь теперь будет повторяться.",
                note: "Используй `/loop off` для отключения."
            },
            off: {
                title: "## ❌ Повтор Отключён",
                message: "Повтор был отключён.",
                note: "Треки будут играть по порядку и остановятся в конце очереди."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при установке режима повтора.\nПожалуйста, попробуйте позже."
            }
        },
        leave: {
            command: {
                name: "leave",
                description: "Заставить бота покинуть голосовой канал"
            },
            success: {
                title: "## 👋 Покинул Голосовой Канал",
                message: "Бот покинул голосовой канал.",
                note: "Используй `/play`, чтобы снова начать воспроизведение."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при выходе из голосового канала.\nПожалуйста, попробуйте позже."
            }
        }
    },
    playlist: {
        createplaylist: {
            command: {
                name: "createplaylist",
                description: "Создать новый плейлист"
            },
            alreadyExists: {
                title: "## ❌ Плейлист уже существует",
                message: "Плейлист с названием **\\\"{name}\\\"** уже существует.",
                note: "Пожалуйста, выберите другое название."
            },
            success: {
                title: "## ✅ Плейлист создан",
                message: "Ваш плейлист **\\\"{name}\\\"** был успешно создан!",
                visibility: "**Видимость:** {visibility}",
                server: "**Сервер:** {server}",
                private: "🔒 Приватный",
                public: "🌐 Публичный"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при создании плейлиста.\\nПожалуйста, попробуйте позже."
            }
        },
        addsong: {
            command: {
                name: "addsong",
                description: "Добавить песню в плейлист"
            },
            notFound: {
                title: "## ❌ Плейлист не найден",
                message: "Плейлист **\\\"{name}\\\"** не существует.",
                note: "Пожалуйста, проверьте название плейлиста и попробуйте снова."
            },
            accessDenied: {
                title: "## 🔒 Доступ запрещён",
                message: "У вас нет разрешения на изменение этого плейлиста.",
                note: "Только владелец плейлиста может добавлять песни."
            },
            success: {
                title: "## ✅ Песня добавлена",
                song: "**Песня:** {song}",
                playlist: "**Плейлист:** {playlist}",
                message: "Песня была успешно добавлена в ваш плейлист!"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при добавлении песни.\\nПожалуйста, попробуйте позже."
            }
        },
        deleteplaylist: {
            command: {
                name: "deleteplaylist",
                description: "Удалить плейлист"
            },
            notFound: {
                title: "## ❌ Плейлист не найден",
                message: "Плейлист **\\\"{name}\\\"** не существует.",
                note: "Пожалуйста, проверьте название плейлиста и попробуйте снова."
            },
            accessDenied: {
                title: "## 🔒 Доступ запрещён",
                message: "У вас нет разрешения на удаление этого плейлиста.",
                note: "Только владелец плейлиста может удалить его."
            },
            success: {
                title: "## ✅ Плейлист удалён",
                message: "Плейлист **\\\"{name}\\\"** был успешно удалён."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при удалении плейлиста.\\nПожалуйста, попробуйте позже."
            }
        },
        deletesong: {
            command: {
                name: "deletesong",
                description: "Удалить песню из плейлиста"
            },
            notFound: {
                title: "## ❌ Плейлист не найден",
                message: "Плейлист **\\\"{name}\\\"** не существует.",
                note: "Пожалуйста, проверьте название плейлиста и попробуйте снова."
            },
            success: {
                title: "## ✅ Песня удалена",
                song: "**Песня:** {song}",
                playlist: "**Плейлист:** {playlist}",
                message: "Песня была успешно удалена из вашего плейлиста."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при удалении песни.\\nПожалуйста, попробуйте позже."
            }
        },
        savequeue: {
            command: {
                name: "savequeue",
                description: "Сохранить текущую очередь как плейлист"
            },
            queueEmpty: {
                title: "## ❌ Очередь пуста",
                message: "Очередь пуста. Нечего сохранять.",
                note: "Сначала добавьте песни в очередь!"
            },
            alreadyExists: {
                title: "## ❌ Плейлист уже существует",
                message: "Плейлист с названием **\\\"{name}\\\"** уже существует.",
                note: "Пожалуйста, выберите другое название."
            },
            success: {
                title: "## ✅ Очередь сохранена!",
                message: "Очередь сохранена как плейлист **\\\"{name}\\\"**",
                tracks: "**Треков:** {count}"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при сохранении очереди.\\nПожалуйста, попробуйте позже."
            }
        },
        myplaylists: {
            command: {
                name: "myplaylists",
                description: "Список всех созданных вами плейлистов"
            },
            noPlaylists: {
                title: "## 📋 Плейлисты не найдены",
                message: "Вы ещё не создали ни одного плейлиста.",
                note: "Используйте `/createplaylist` для создания вашего первого плейлиста!"
            },
            title: "## 📂 Ваши плейлисты (Страница {currentPage}/{totalPages})",
            playlistItem: "**{number}.** **{name}**\\n   • Видимость: **{visibility}**\\n   • Сервер: {server}\\n   • Песен: **{count}**",
            visibilityPrivate: "🔒 Приватный",
            visibilityPublic: "🌐 Публичный",
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при получении ваших плейлистов.\\nПожалуйста, попробуйте позже."
            }
        },
        allplaylists: {
            command: {
                name: "allplaylists",
                description: "Список всех публичных плейлистов"
            },
            noPlaylists: {
                title: "## 📋 Публичные плейлисты не найдены",
                message: "Нет доступных публичных плейлистов.",
                note: "Создайте публичный плейлист, используя `/createplaylist`!"
            },
            title: "## 🌐 Публичные плейлисты (Страница {currentPage}/{totalPages})",
            playlistItem: "**{number}.** **{name}**\\n   • Создатель: {creator}\\n   • Сервер: {server}\\n   • Песен: **{count}**",
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при получении публичных плейлистов.\\nПожалуйста, попробуйте позже."
            }
        },
        showsongs: {
            command: {
                name: "showsongs",
                description: "Показать все песни в плейлисте"
            },
            notFound: {
                title: "## ❌ Плейлист не найден",
                message: "Плейлист **\\\"{name}\\\"** не существует.",
                note: "Пожалуйста, проверьте название плейлиста и попробуйте снова."
            },
            accessDenied: {
                title: "## 🔒 Доступ запрещён",
                message: "У вас нет разрешения на просмотр этого плейлиста.",
                note: "Этот плейлист приватный, и только владелец может просматривать его."
            },
            empty: {
                title: "## 📋 Песни в \\\"{name}\\\"",
                message: "Этот плейлист пуст. Добавьте песни, используя `/addsong`!"
            },
            title: "## Песни в \\\"{name}\\\" (Страница {currentPage}/{totalPages})",
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при отображении песен плейлиста.\\nПожалуйста, попробуйте позже."
            }
        },
        playcustomplaylist: {
            command: {
                name: "playcustomplaylist",
                description: "Воспроизвести пользовательский плейлист"
            },
            notFound: {
                title: "## ❌ Плейлист не найден",
                message: "Плейлист **\\\"{name}\\\"** не существует.",
                note: "Пожалуйста, проверьте название плейлиста и попробуйте снова."
            },
            accessDenied: {
                title: "## 🔒 Доступ запрещён",
                message: "У вас нет разрешения на воспроизведение этого плейлиста.",
                note: "Этот плейлист приватный, и только владелец может воспроизводить его."
            },
            empty: {
                title: "## ❌ Пустой плейлист",
                message: "Плейлист **\\\"{name}\\\"** пуст.",
                note: "Сначала добавьте песни в плейлист!"
            },
            lavalinkManagerError: {
                title: "## ❌ Ошибка менеджера Lavalink",
                message: "Менеджер узлов Lavalink не инициализирован.",
                note: "Пожалуйста, свяжитесь с администратором бота."
            },
            noNodes: {
                title: "## ❌ Нет узлов Lavalink",
                message: "В настоящее время нет доступных узлов Lavalink ({connected}/{total} подключено).",
                note: "Бот пытается переподключиться. Пожалуйста, попробуйте через мгновение."
            },
            resolveError: {
                title: "## ❌ Ошибка разрешения песни",
                message: "Не удалось разрешить одну или несколько песен из плейлиста.",
                note: "Пожалуйста, проверьте плейлист и попробуйте снова."
            },
            success: {
                title: "## Воспроизведение плейлиста",
                message: "Сейчас воспроизводится плейлист **\\\"{name}\\\"**",
                songs: "**Песен:** {count}"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при воспроизведении плейлиста.\\nПожалуйста, попробуйте позже."
            }
        }
    },
    utility: {
        twentyfourseven: {
            command: {
                name: "247",
                description: "Переключить режим 24/7 (бот остаётся в голосовом канале)"
            },
            accessDenied: {
                title: "## ❌ Доступ запрещён",
                message: "Только владелец сервера может переключать режим 24/7."
            },
            enabled: {
                title: "## ✅ Режим 24/7 включён",
                message: "Режим 24/7 был **включён** для этого сервера.",
                note: "🔄 Бот останется в голосовом канале даже когда очередь пуста."
            },
            disabled: {
                title: "## ❌ Режим 24/7 отключён",
                message: "Режим 24/7 был **отключён** для этого сервера.",
                note: "⏹️ Бот покинет голосовой канал, когда очередь закончится."
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при обновлении режима 24/7.",
                note: "Пожалуйста, попробуйте позже."
            }
        },
        history: {
            command: {
                name: "history",
                description: "Показать недавно воспроизведённые треки"
            },
            noHistory: {
                title: "## 📜 История не найдена",
                message: "История воспроизведения для этого сервера не найдена.",
                note: "Воспроизведите несколько песен, чтобы создать вашу историю!"
            },
            title: "## 📜 История воспроизведения",
            titlePaginated: "## 📜 История воспроизведения (Страница {currentPage}/{totalPages})",
            noMoreSongs: "- Больше нет песен в истории.",
            buttons: {
                previous: "Назад",
                next: "Вперёд"
            },
            errors: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при получении истории.",
                note: "Пожалуйста, попробуйте позже."
            }
        }
    },
    events: {
        interactionCreate: {
            noGuild: "❌ **Эта команда может использоваться только на сервере.**",
            commandNotFound: "❌ **Команда не найдена!**",
            noPermission: "❌ **У вас нет разрешения на использование этой команды.**",
            errorOccurred: "❌ **Произошла ошибка: {message}**",
            unexpectedError: "❌ **Произошла непредвиденная ошибка. Пожалуйста, попробуйте позже.**",
            errorTryAgain: "❌ Произошла ошибка. Пожалуйста, попробуйте снова."
        }
    },
    utils: {
        voiceChannelCheck: {
            noVoiceChannel: {
                title: "## ❌ Нет голосового канала",
                message: "Вам нужно быть в голосовом канале для использования этой команды.",
                note: "Пожалуйста, присоединитесь к голосовому каналу и попробуйте снова."
            },
            wrongChannel: {
                title: "## Присоединитесь к голосовому каналу",
                message: "Бот сейчас активен в **{channelName}**.",
                note: "Пожалуйста, присоединитесь к **{channelName}** для использования музыкальных команд."
            }
        },
        playerValidation: {
            queueEmpty: {
                title: "## ❌ Очередь пуста",
                message: "Очередь пуста. Нет доступных песен.",
                note: "Сначала добавьте песни в очередь, используя `/play`."
            },
            noSongPlaying: {
                title: "## ❌ Песня не воспроизводится",
                message: "В настоящее время не воспроизводится ни одна песня.",
                note: "Используйте `/play` для начала воспроизведения музыки."
            },
            noMusicPlaying: {
                title: "## ❌ Музыка не воспроизводится",
                message: "В настоящее время музыка не воспроизводится, и очередь пуста.",
                note: "Используйте `/play` для начала воспроизведения музыки."
            }
        },
        responseHandler: {
            defaultError: {
                title: "## ❌ Ошибка",
                message: "Произошла ошибка при обработке команды.",
                note: "Пожалуйста, попробуйте позже."
            },
            commandError: "❌ Произошла ошибка при обработке команды {commandName}."
        }
    },
    console: {
        bot: {
            clientLogged: "Клиент вошёл как {tag}",
            musicSystemReady: "Музыкальная система Riffy готова 🎵",
            lavalinkError: "Ошибка инициализации плеера: {message}",
            nodeManagerStatus: "Менеджер узлов: {available}/{total} узлов доступно",
            nodeStatus: "Статус узла:",
            nodeInfo: "{icon} {name} ({host}:{port}) - {status}{error}",
            commandsLoaded: "Всего загружено команд: {count}",
            commandLoadFailed: "Не удалось загрузить: {name} - отсутствуют данные или свойство run",
            commandLoadError: "Ошибка загрузки {name}: {message}",
            tokenVerification: "🔐 ПРОВЕРКА ТОКЕНА",
            tokenAuthFailed: "Аутентификация не удалась ❌",
            tokenError: "Ошибка: Включите Intents или сбросьте новый токен",
            databaseOnline: "База данных онлайн ✅",
            databaseStatus: "🕸️  СТАТУС БАЗЫ ДАННЫХ",
            databaseConnection: "🕸️  ПОДКЛЮЧЕНИЕ К БАЗЕ ДАННЫХ",
            databaseFailed: "Подключение не удалось ❌",
            databaseError: "Ошибка: {message}",
            unhandledRejection: "Необработанное отклонение:",
            uncaughtException: "Неперехваченное исключение:",
            riffyThumbnailError: "[ Riffy ] Игнорирование ошибки миниатюры: {message}"
        },
        events: {
            rest: {
                commandsRegistered: "Успешно зарегистрировано {count} команд приложения (/) глобально ✅",
                commandsFailed: "Не удалось зарегистрировать команды ❌",
                error: "Ошибка: {message}",
                details: "Подробности: {details}"
            },
            interaction: {
                commandNotFound: "Команда не найдена: {commandName}",
                errorExecuting: "Ошибка выполнения команды {commandName}:",
                errorHelpButton: "Ошибка обработки кнопки возврата помощи:",
                errorHelpSelect: "Ошибка обработки выбора категории помощи:",
                unexpectedError: "Непредвиденная ошибка:",
                failedToSendError: "Не удалось отправить сообщение об ошибке:"
            }
        },
        database: {
            uriNotDefined: "URI базы данных не определён в конфигурации.",
            skippingConnection: "Пропуск подключения к базе данных, так как URI не предоставлен.",
            connected: "Подключено к базе данных ✅",
            connectionFailed: "Не удалось подключиться к базе данных. Продолжение без функциональности базы данных."
        },
        lavalink: {
            nodesConfigured: "Настроено узлов: {count}",
            riffyInitialized: "Инициализировано с {count} узлом(ами)",
            nodeKeys: "Ключи узлов:",
            failedToInitialize: "Не удалось инициализировать Riffy: {message}",
            riffyReinitialized: "Riffy переинициализирован",
            failedToReinitialize: "Не удалось переинициализировать Riffy: {message}",
            nodeConnected: "Подключено: {name} ({host}:{port}) • {available}/{total} активных",
            nodeDisconnected: "Отключено: {name} ({host}:{port}) • {available}/{total} активных",
            retryLimitReported: "Лимит повторных попыток сообщён {name}; цикл переподключения продолжается",
            nodeError: "Ошибка: {name} ({host}:{port}) • {message}",
            nodeStatus: "{available}/{total} активных",
            waitingForConnection: "Ожидание подключения узла Lavalink...",
            nodeAvailable: "Узел доступен ({count} подключено)",
            noNodesConnected: "Нет подключённых узлов ({connected}/{total}) — попытка переподключения...",
            nodeStatusReport: "Статус узла: {connected}/{total} подключено"
        },
        player: {
            lacksPermissions: "У бота нет необходимых разрешений для отправки сообщений в этот канал.",
            errorSendingMessage: "Ошибка отправки сообщения: {message}",
            trackException: "Исключение трека для сервера {guildId}: {message}",
            trackStuck: "Трек застрял для сервера {guildId}: {message}",
            trackNull: "Трек null или отсутствует информация для сервера {guildId} - игнорирование события",
            playerInvalid: "Плеер недействителен или уничтожен для сервера {guildId} - игнорирование события",
            channelNotFound: "Канал не найден для сервера {guildId}",
            errorSavingHistory: "Ошибка сохранения в историю:",
            errorMusicCard: "Ошибка создания или отправки музыкальной карточки: {message}",
            autoplayDisabled: "Автовоспроизведение отключено для сервера: {guildId}",
            errorQueueEnd: "Ошибка обработки конца очереди:",
            errorCleanupPrevious: "Ошибка очистки предыдущего сообщения трека:",
            errorCleanupTrack: "Ошибка очистки сообщения трека:",
            lyricsFetchError: "❌ Ошибка получения текста: {message}",
            unableToSendMessage: {
                title: "## ⚠️ Невозможно отправить сообщение",
                message: "Невозможно отправить сообщение. Проверьте права бота."
            },
            trackError: {
                title: "## ⚠️ Ошибка трека",
                message: "Не удалось загрузить трек.",
                skipping: "Переход к следующей песне..."
            },
            unableToLoadCard: {
                title: "## ⚠️ Невозможно загрузить карточку трека",
                message: "Невозможно загрузить карточку трека. Продолжение воспроизведения..."
            },
            queueEnd: {
                noMoreAutoplay: "⚠️ **Больше нет треков для автовоспроизведения. Отключение...**",
                queueEndedAutoplayDisabled: "🎶 **Очередь закончилась. Автовоспроизведение отключено.**",
                queueEmpty: "👾 **Очередь пуста! Отключение...**",
                twentyfoursevenEmpty: "🔄 **Режим 24/7: Бот останется в голосовом канале. Очередь пуста.**"
            },
            voiceChannelRequired: {
                title: "## 🔒 Требуется голосовой канал",
                message: "Вам нужно быть в том же голосовом канале, чтобы использовать элементы управления!"
            },
            controls: {
                skip: "⏭️ **Переход к следующей песне...**",
                queueCleared: "🗑️ **Очередь была очищена!**",
                playbackStopped: "⏹️ **Воспроизведение остановлено, и плеер уничтожен!**",
                alreadyPaused: "⏸️ **Воспроизведение уже приостановлено!**",
                playbackPaused: "⏸️ **Воспроизведение приостановлено!**",
                alreadyResumed: "▶️ **Воспроизведение уже возобновлено!**",
                playbackResumed: "▶️ **Воспроизведение возобновлено!**",
                volumeMax: "🔊 **Громкость уже на максимуме!**",
                volumeMin: "🔉 **Громкость уже на минимуме!**",
                volumeChanged: "🔊 **Громкость изменена на {volume}%!**",
                trackLoopActivated: "🔁 **Повтор трека активирован!**",
                queueLoopActivated: "🔁 **Повтор очереди активирован!**",
                loopDisabled: "❌ **Повтор отключён!**"
            },
            lyrics: {
                noSongPlaying: "🚫 **Сейчас ничего не воспроизводится.**",
                notFound: "❌ **Текст не найден!**",
                liveTitle: "## Живой текст: {title}",
                syncing: "🔄 Синхронизация текста...",
                fullTitle: "## Полный текст: {title}",
                stopButton: "Остановить текст",
                fullButton: "Полный текст",
                deleteButton: "Удалить"
            },
            trackInfo: {
                title: "**Название:**",
                author: "**Исполнитель:**",
                length: "**Длительность:**",
                requester: "**Запросил:**",
                source: "**Источник:**",
                progress: "**Прогресс:**",
                unknownArtist: "Неизвестный исполнитель",
                unknown: "Неизвестно"
            },
            controlLabels: {
                loop: "Повтор",
                disable: "Отключить",
                skip: "Пропустить",
                queue: "Очередь",
                clear: "Очистить",
                stop: "Стоп",
                pause: "Пауза",
                resume: "Возобновить",
                volUp: "Громкость +",
                volDown: "Громкость -"
            }
        }
    }
};
export default lang;