let movies = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        console.log("Загрузка movies.json...");
        const response = await fetch("movies.json");

        if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);

        movies = await response.json();
        console.log("JSON загружен:", movies);
        loadMovies();
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

function openPlayer(movieIndex, episodeIndex) {
    const videoContainer = document.getElementById("video-container");
    const videoSource = document.getElementById("video-source");
    const videoPlayer = document.getElementById("video-player");

    const movie = movies[movieIndex];

    if (movie.video) {
        // Обычный фильм
        videoSource.src = movie.video;
    } else if (movie.episodes) {
        // Сериал (переход между сериями)
        if (!movie.episodes[episodeIndex]) {
            console.error("Ошибка: серия не найдена!");
            alert("Ошибка: Серия не найдена!");
            return;
        }
        videoSource.src = movie.episodes[episodeIndex];

        // Автоматический переход на следующую серию
        videoPlayer.onended = () => {
            if (episodeIndex < movie.episodes.length - 1) {
                openPlayer(movieIndex, episodeIndex + 1);
            } else if (movieIndex < movies.length - 1 && movies[movieIndex + 1].episodes) {
                openPlayer(movieIndex + 1, 0);
            } else {
                alert("Сериал завершён!");
            }
        };
    } else {
        console.error("Ошибка: видео не найдено!");
        alert("Ошибка: Видео не найдено!");
        return;
    }

    videoPlayer.load();
    videoContainer.classList.remove("hidden");
    videoPlayer.play();

    console.log(`Запущено: ${movie.title}, Серия ${episodeIndex + 1 || "Фильм"}, Видео: ${videoSource.src}`);
}

function closePlayer() {
    const videoContainer = document.getElementById("video-container");
    const videoPlayer = document.getElementById("video-player");

    videoPlayer.pause();
    videoContainer.classList.add("hidden");
}
