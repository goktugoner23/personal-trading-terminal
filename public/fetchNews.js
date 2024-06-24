document.addEventListener('DOMContentLoaded', () => {
    fetchNews();
    setInterval(fetchNews, 300000); // Fetch news every 5 minutes

    function fetchNews() {
        const newsContent = document.getElementById('news-content');
        const apiUrl = 'http://localhost:3000/api/news'; // Backend endpoint

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                newsContent.innerHTML = ''; // Clear previous news items
                data.slice(0, 10).forEach(newsItem => { // Display only the latest 10 news items
                    const newsElement = document.createElement('div');
                    newsElement.classList.add('news-item');

                    const titleElement = document.createElement('div');
                    titleElement.classList.add('news-title');
                    const titleLink = document.createElement('a');
                    titleLink.href = newsItem.link;
                    titleLink.target = "_blank"; // Open link in a new tab
                    titleLink.textContent = newsItem.title;
                    titleElement.appendChild(titleLink);

                    const metaElement = document.createElement('div');
                    metaElement.classList.add('news-meta');

                    const dateElement = document.createElement('span');
                    dateElement.classList.add('news-date');
                    dateElement.textContent = newsItem.date;

                    metaElement.appendChild(dateElement);

                    newsElement.appendChild(titleElement);
                    newsElement.appendChild(metaElement);

                    newsContent.appendChild(newsElement);
                });
            })
            .catch(error => {
                console.error('Error fetching news:', error);
            });
    }
});
