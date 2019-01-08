function change_index(name) {
    document.getElementById('index_' + previous_index).className = 'non_active index';
    document.getElementById('index_' + name).className = 'active index';
    document.getElementById('content_' + previous_index).style.display = 'none';
    document.getElementById('content_' + name).style.display = 'flex';
    previous_index = name;
}