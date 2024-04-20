// all vote utility functions: update vote_count and trigger flag accordingly, as well as increment author's reputation score
const User = require('../models/users');

const updateVoteCountAndFlag = async (Model, referenceId, voteChange, onModel) => {
    const updateItem = await Model.findByIdAndUpdate(referenceId, { $inc: { vote_count: voteChange } }, { new: true });

    if (updateItem.vote_count <= -15) {
        updateItem.flag = true;
        await updateItem.save();
    }
    return updateItem;
};

const updateUserReputation = async (item, voteChange, isUpvote) => {
    const reputationChange = isUpvote ? 10 : -2;
    const userId = item.asked_by || item.ans_by;
    const user = await User.findById(userId);

    if (user) {
        // Ensure reputation does not drop below 1
        let newReputation = user.reputation + reputationChange;
        if (newReputation < 1) newReputation = 1;

        user.reputation = newReputation;
        await user.save();
        return user;
    }

    throw new Error('User not found');
};

module.exports = {
    updateVoteCountAndFlag, updateUserReputation};
