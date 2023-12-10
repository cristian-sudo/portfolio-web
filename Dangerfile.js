import { danger, warn } from 'danger';

// eslint-disable-next-line no-unused-vars
function gitBranchingRules(options, danger) {
    const { rules, response } = options;
    const { github } = danger;

    const baseBranch = github.pr.base.ref;
    const headBranch = github.pr.head.ref;

    let ruleMatch = false;
    let failedRuleIndex = -1;

    for (const [i, rule] of rules.entries()) {
        const { head, base } = rule;

        if (head.test(headBranch) && base.test(baseBranch)) {
            ruleMatch = true;
            break;
        } else if (head.test(headBranch)) {
            failedRuleIndex = i;
        }
    }

    if (!ruleMatch) {
        const detailedMsg = failedRuleIndex === -1 ? 'The head branch doesn\'t match any allowed branch naming rules.' : `${rules[failedRuleIndex].message}.`;
        response(`${detailedMsg} Please check your branch names and merge targets.`);
    }
}

function checkLockFiles(options, danger) {
    const {baseFile, lockFile, hint, response} = options;

    const fileChanged = danger.git.modified_files.includes(baseFile);
    const lockfileChanged = danger.git.modified_files.includes(lockFile);

    if (fileChanged && !lockfileChanged) {
        const message = `Changes were made to ${baseFile}, but not to ${lockFile}`;
        const idea = `Perhaps you need to run \`${hint}\`?`;

        response(`${message} - <i>${idea}</i>`);
    }
}

function checkReviewers(options, danger) {
    const {min = 0, response} = options;
    const { github } = danger;

    const reviewers = github.pr.requested_reviewers.length;

    if (reviewers === 0) {
        response('There are no reviewers assigned to this PR. Please add a reviewer before merging.');
    } else if (reviewers < min) {
        response(`There are less than ${min} reviewers assigned to the PR. Please ensure enough people have been assigned.`);
    }
}

function checkSystemFiles(path, danger) {
    const src = danger.git.fileMatch(path);

    if (src.modified) {
        warn('There are modified system files within this branch - please check they are valid.');
    }
}

checkLockFiles({
    baseFile: 'package.json',
    lockFile: 'package-lock.json',
    hint: 'npm i',
    response: warn,
}, danger);

checkLockFiles({
    baseFile: 'composer.json',
    lockFile: 'composer.lock',
    hint: 'composer update',
    response: warn,
}, danger);

checkReviewers({
    min: 1,
    response: warn,
}, danger);

checkSystemFiles('app/**/*', danger);
checkSystemFiles('config/**/*', danger);