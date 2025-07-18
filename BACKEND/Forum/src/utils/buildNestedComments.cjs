function buildCommentTree(comments) {
    const map = new Map();
    const roots = [];
    
    // First pass: create map and initialize children
    for (const comment of comments) {
        comment.children = [];
        map.set(comment.commentId, comment);
    }
    
    // Second pass: build hierarchy
    for (const comment of comments) {
        if (comment.parentCommentId) {
            const parent = map.get(comment.parentCommentId);
            parent ? parent.children.push(comment) : roots.push(comment);
        } else {
            roots.push(comment);
        }
    }
    
    return roots.sort((a, b) => a.createdAt - b.createdAt); // Sort roots by newest first
}

const createNestedComment = async(comments)=>{
    return buildCommentTree(comments)
}

module.exports = createNestedComment