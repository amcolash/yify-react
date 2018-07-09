window.onload = function() {
    // Data is stored in the url (passed from main react app to this dummy page)
    // Decode the uri data and then parse out json
    var url = new URL(window.location.href);
    var data = url.searchParams.get("data");
    
    if (data) {
        // Parse data from the url parameter
        data = JSON.parse(decodeURIComponent(data));
    
        var title = document.getElementById('title');
        title.innerHTML = data.title;
    
        var source = document.createElement('source');
        source.setAttribute('src', data.url);
    
        var video = document.getElementById('video');
        video.appendChild(source);
    }
}
