function createWindow(title, content) {
    const template = document.getElementById('window-template');
    const clone = template.content.cloneNode(true);
    
    clone.querySelector('.window-title').innerText = title;
    clone.querySelector('.window-body').innerHTML = content;
    
    const win = clone.querySelector('.window');
    win.style.top = '50px';
    win.style.left = '50px';
    
    document.getElementById('windows').appendChild(clone);
    
    win.querySelector('.close-btn').addEventListener('click', () => {
        win.remove();
    });
}

document.getElementById('dock-files').addEventListener('click', () => {
    createWindow('Files', 'File browser content...');
});

document.getElementById('dock-terminal').addEventListener('click', () => {
    createWindow('Terminal', 'user@os:~$');
});

document.getElementById('dock-notes').addEventListener('click', () => {
    createWindow('Notes', 'Write something here...');
});