import "./DraftPosts.css";
import DraftEntry from "../DraftEntry/DraftEntry";

function DraftPosts(){
  return (
    <div className="draftsDiv">
      <div className="draftsMain">
        <div className="draftsTitle">
          <div className="myDrafts">Drafts</div>
          <DraftEntry draftTitle="db lab 2 report" draftDate="7/17/2025" draftContents="In Filter from Exercise 1, we have included a second line where we use the superclass Operator" />
        </div>
      </div>
    </div>
  );
};

export default DraftPosts;