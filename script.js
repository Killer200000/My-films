let movies = [];
let player;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Загрузка movies.json...");
        const response = await fetch("movies.json");

        if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);

        movies = await response.json();
        console.log("JSON загружен:", movies);
        loadMovies();

        // Инициализация Plyr.js
        player = new Plyr("#player", {
            controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
            settings: ['quality', 'speed'],
            fullscreen: { enabled: true, fallback: true, iosNative: true },
            ratio: '16:9'
        });

    } catch (error) {
        console.error("Ошибка загрузки фильмов:", error);
    }
});

function loadMovies() {
    const container = document.getElementById("movies-container");
    container.innerHTML = "";

    movies.forEach((movie, index) => {
        const movieDiv = document.createElement("div");
        movieDiv.classList.add("movie");

        movieDiv.innerHTML = `
            <img src="${movie.poster}?v=${Date.now()}" alt="${movie.title}">
            <div class="movie-title">${movie.title}</div>
            <button class="watch-button" onclick="openPlayer(${index}, 0)">Смотреть</button>
        `;

        container.appendChild(movieDiv);
    });

    console.log("Список фильмов загружен:", movies);
}

function openPlayer(movieIndex, episodeIndex = 0) {
    const videoContainer = document.getElementById("video-container");
    const videoSource = document.getElementById("video-source");

    const movie = movies[movieIndex];

    if (movie.video) {
        videoSource.src = movie.video;
    } else if (movie.episodes) {
        videoSource.src = movie.episodes[episodeIndex];

        // Автоматический переход на следующую серию
        player.on("ended", () => {
            if (episodeIndex < movie.episodes.length - 1) {
                openPlayer(movieIndex, episodeIndex + 1);
            } else {
                alert("Сезон завершён!");
            }
        });
    } else {
        alert("Ошибка: Видео не найдено!");
        return;
    }

    // Очищаем предыдущие источники перед установкой нового
    player.source = {
        type: 'video',
        sources: [{ src: videoSource.src, type: 'video/mp4' }]
    };

    videoContainer.classList.remove("hidden");
    player.play();
}

// Функция закрытия плеера (исправленная версия)
function closePlayer() {
    const videoContainer = document.getElementById("video-container");

    player.stop(); // Полностью останавливаем видео
    player.source = {
        type: 'video',
        sources: [{ src: "", type: "video/mp4" }] // Очищаем источник, но не ломаем Plyr
    };

    videoContainer.classList.add("hidden");
}

// Фильтр фильмов (поиск)
function filterMovies() {
    const searchQuery = document.getElementById("search-input").value.toLowerCase();
    const moviesDivs = document.querySelectorAll(".movie");

    moviesDivs.forEach(movieDiv => {
        const title = movieDiv.querySelector(".movie-title").textContent.toLowerCase();
        movieDiv.style.display = title.includes(searchQuery) ? "block" : "none";
    });
}
