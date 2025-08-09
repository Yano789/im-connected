const createNestedComment = require("../utils/buildNestedComments.cjs")


describe("utils.buildNestedComments() tests",()=>{
    test ("testing buildNestedComments()",async ()=>{
        const input = [{commentId:"1",postId:"1",parentCommentId:null,username:"sean",content:"hi",createdAt:"10",edited:false},
            {commentId:"2",postId:"1",parentCommentId:"1",username:"John",content:"sup",createdAt:"11",edited:false},
            {commentId:"3",postId:"1",parentCommentId:"1",username:"sean",content:"how you doing",createdAt:"12",edited:false},
            {commentId:"4",postId:"1",parentCommentId:"3",username:"John",content:"Just replying to your comment",createdAt:"13",edited:false},
            {commentId:"5",postId:"1",parentCommentId:null,username:"sean",content:"yo",createdAt:"15",edited:false}
        ]

        const result = await createNestedComment(input)
        console.log(result)
        expect(result.length).toBe(2)
        expect(result[0].commentId).toBe("1")
        expect(result[0].children[0].commentId).toBe("2") // while top level comments are arranged to be newest, nested comments are earliest
        expect(result[0].children[1].children[0].commentId).toBe("4")
    })

    test ("testing empty array in buildNestedComments()",async()=>{
        const result = await createNestedComment([])
        expect(result).toEqual([])
    })
})