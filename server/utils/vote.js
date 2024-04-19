// all vote utility functions: update vote_count and trigger flag accordingly, as well as increment author's reputation score

const updateVoteCountAndFlag = async (Model, referenceId, voteChange, onModel) => {
    const updateItem = await Model.findByIdAndUpdate(referenceId, { $inc: { vote_count: voteChange } }, { new: true });

    if (updateItem.vote_count <= -15) {
        updateItem.flag = true;
        await updateItem.save();
    }
    return updateItem;
};

module.exports = {
    updateVoteCountAndFlag
};
