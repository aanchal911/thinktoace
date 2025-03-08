document.addEventListener("DOMContentLoaded", function () {
    // YouTube API Integration Code
    const API_KEY = "YOUR_YOUTUBE_API_KEY"; // Replace with your actual API key
  
    // Query selectors for search elements (if you removed the select, ignore it)
    const searchInput = document.querySelector(".search-bar input");
    // If you removed the dropdown from your HTML, comment out the following line:
    // const categorySelect = document.querySelector(".search-bar select");
    const searchBtn = document.querySelector(".search-bar button");
  
    // Create and append a container for video results
    const videoContainer = document.createElement("div");
    videoContainer.id = "videoContainer";
    const heroContainer = document.querySelector(".hero .container");
    if (heroContainer) {
      heroContainer.appendChild(videoContainer);
    } else {
      console.error("Hero container not found!");
    }
  
    // Event listener for search button
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      if (!query) {
        alert("Please enter a search term.");
        return;
      }
      
      // If you removed the dropdown, simply fetch videos:
      fetchVideos(query);
      
      /* 
      // If you still have a dropdown and want to check its value:
      const category = categorySelect ? categorySelect.value : "Videos";
      if (category === "Videos") {
        fetchVideos(query);
      } else {
        alert("Feature for " + category + " is coming soon!");
      }
      */
    });
  
    // Function to fetch videos from YouTube API
    async function fetchVideos(query) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&key=${API_KEY}`
        );
        const data = await response.json();
        // Debug: Log the data to the console
        console.log("YouTube API response:", data);
        displayVideos(data.items);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    }
  
    // Function to display fetched videos
    function displayVideos(videos) {
      videoContainer.innerHTML = ""; // Clear previous results
      videos.forEach(video => {
        const videoId = video.id.videoId;
        const title = video.snippet.title;
        const thumbnail = video.snippet.thumbnails.medium.url;
  
        const videoElement = `
          <div class="video-card">
            <img src="${thumbnail}" alt="${title}" onclick="playVideo('${videoId}')">
            <p>${title}</p>
          </div>
        `;
        videoContainer.innerHTML += videoElement;
      });
    }
  
    // Function to play a selected video in an iframe
    window.playVideo = function(videoId) { // Exposed to window for onclick
      videoContainer.innerHTML = `
        <iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" 
        frameborder="0" allowfullscreen></iframe>
      `;
    };
  
    /* Additional Code (e.g., Dark Mode Toggle & 3D Background Animation) */
    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");
      });
    }
  
    // Initialize 3D background animation using Three.js (if you have a canvas with id "bgAnimation")
    function init3DBackground() {
      const canvas = document.getElementById('bgAnimation');
      if (!canvas) return; // Skip if canvas is not present
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;
      
      // Example: Rotating wireframe cube
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0xff9500, wireframe: true });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);
      
      function animate() {
        requestAnimationFrame(animate);
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
        renderer.render(scene, camera);
      }
      
      animate();
      
      // Handle window resize
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
    init3DBackground();
  });
  