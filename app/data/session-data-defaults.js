module.exports = {
    "versionHistory": {
        "claimsCurrent": "v8",
        "claimVersions": [
            {
                "versionNo": "9",
                "status": "design",
                "tested": "TBC",
                "created": [
                    "TODO"
                ],
                "aims": [
                    "TODO"
                ],
                "learnt": [
                    "TODO"
                ]
            },
            {
                "versionNo": "8",
                "status": "dev",
                "tested": "w/c 8 April 2024, 6 May 2024",
                "created": [
                    "account creation journey for the signatory that will be invited to the service based on minimal tech effort process flow",
                    "Improve accessibility of manage claims views by remove tabular view for each status and putting onto seperate pages",
                    "Manage claims concept test looking at the option of dsiplayed claims in a list pattern rather than a table that may better cater for 60/40 and CPD claims",
                    "Added awareness information through journey articulating policy start date",
                    "Removed references to CPD for MVP",
                    "Revised new claim flow to start with select training to accomodate 60/40 claims in the future with less rework",
                    "Removed paid status for MVP due to technical feasibility",
                    "[TOFINISH]"
                ],
                "aims": [
                    "TODO"
                ],
                "learnt": [
                    "TODO"
                ]
            },
            {
                "versionNo": "7",
                "status": "retired",
                "tested": "Untested",
                "created": [
                    "added a new dashboard screen after sign in to indicate how we could show live data about an organisation's claims, and to present the 3 main user options (eligibility checker, manage care skills claims, manage revalidation claims)",
                    "replaced the filters on each tab with a cross-status search function",
                    "shortened the table headings (for example, changing 'claim reference number' to just 'claim reference')",
                    "changed the claim details page to bring it in line with the GDS check answers pattern and removed the incomplete tags",
                    "changed how learners were displayed to remove the summary card component",
                    "removed the 'cost per learner' field and added the 'payment date' field to indicate when the employer paid for the training",
                    "introduced the new 'maximum reimbursable amount per learner' element in the top right of the claim details screen (on approval this changes to show actual reimbursed amount)",
                    "added the claim history timeline component for submitted claims",
                    "added the manage and start claim screens for revalidation (CPD) funding",
                    "started to consider the implications of split claims, where 60% of the reimbursement is provided upfront and 40% on completion"
                ],
                "aims": [
                    "explore how the service could signpost users to activities that require their attention",
                    "test cross-status search function",
                    "test revised claim detail screen with more standard GDS check answer - missing information pattern and iterated learner list presenation",
                    "understand any challenges that may arise for users when asking for payment date",
                    "test understanding of maximum reimbursable amount section",
                    "understand user needs around claim/audit history information",
                    "test manage and start claim flows for revalidation (CPD) funding"
                ],
                "learnt": [
                    "This prototype did not move into usability testing with users due to a pivot on scope of work for start of private beta MVP.",
                    "Many of the features and needs address in this version were removeed from scope for MVP."
                ]
            },
            {
                "versionNo": "6",
                "status": "retired",
                "tested": "w/c 29 January 2024",
                "created": [
                    "included the agreed service name",
                    "combined our insights about funding pot names into 2 possible start pages so users could pick their preferred wording",
                    "introduced an optioanl help page when a user starts a new claim for the first time",
                    "iterated the declaration text that someone must agree to when submitting a claim",
                ],
                "aims": [
                    "discuss and agree the funding pot names",
                    "test the scope information (above 'Start now')",
                    "discuss the user understanding of eligibility throughout the pages",
                    "explore the 'Help' page with video content and when this might be more useful",
                    "understand when text-based guidance might be most useful to users"
                ],
                "learnt": [
                    "users preferred version A of the start page ('care skills' and 'revalidation' funding)",
                    "we could improve the wording to clarify that booking training is outside the scope of the service",
                    "eligibility information is generally clear",
                    "the help content when starting a new claim is much appreciated and some users may prefer the video or text content",
                    "similar help content around evidence requirements would also be useful",
                    "the declaration text was clear, though users wanted a link to the grant award letter and also to potentially see more information about the types of checks that will be carried out"
                ]
            },
            {
                "versionNo": "5",
                "status": "retired",
                "tested": "w/c 8 Jan 2024",
                "created": [
                    "improved the start screen to make it make it clear this service isn't for booking training",
                    "explored further ways to describe the funding pots",
                    "removed the service name so that users could vote on their preference without being swayed",
                    "introduced a new claim screen to make it much easier for users to see what claim information they'd alredy added and what was incomplete or missing",
                    "changed the concept of a 'claim' to relate to a set of learners doing a course on a particular date (rather than a claim only ever being for one learner) which massively shortens the claims list and relates better to users' mental models",
                    "got the filters working on each tab of the 'manage claims' screen",
                    "changed the 'insufficient evidence' status backed to 'queried' as this had caused confusion",
                    "tidied up the data to make it more realistic and got the numbers of claims in each status working dynamically",
                    "added column sorting and dummy pagination links to the 'manage claims' screen"
                ],
                "aims": [
                    "whether the new ways of describing the funding pots worked better for users",
                    "if the improved way of starting and editing claims was more intuitive and allowed users to understand better the different components that make up a claim",
                    "if the new definition of a claim works better than every learner on a course needing a separate claim",
                    "how users would manage claims once they've been added and if they could progress a claim to the point at which it's paid",
                    "whether the 'ready to submit' claim status is useful or if it could lead to confusion",
                    "whether users were comfortable with National Insurance numbers being used for the unique learner ID"
                ],
                "learnt": [
                    "the new funding pot names still didn't work well, as participants found it confusing to have registered managers included in the 'non-registered professionals' funding",
                    "the difference between the 'incomplete' and 'ready to submit' claim statuses was not clear, especially when claims automatically moved to 'ready to submit' when there might be additional learners to add",
                    "users thought the 'queried' tab was for claims they had queried, rather than claims queried by NHSBSA",
                    "many participants struggled to find the search filters",
                    "they found it confusing that they could only filter within a status and there was no way to search for a claim across all statuses",
                    "feedback on the new claim screen was generally very positive, though a few users thought the use of 'incomplete' tags to indicate missing data was confusing as it made them think the claim had already been started",
                    "the new claim definition (a single activity with potentially multiple learners) worked well for everyone",
                    "the role groups when adding a new learner need further investigation as some participants felt they were not mutually exclusive",
                    "not everyone spotted the notes field when adding a claim and if they did they weren't sure what it was for"
                ]
            },
            {
                "versionNo": "4",
                "status": "retired",
                "tested": "w/c 11 December 2023",
                "created": [
                    "added large volumes of realistic data on learners, courses and claims",
                    "introduced much more realistic ways to interact with the data, so that true usability testing could take place",
                    "changed the way we described the 2 funding pots and removed the references to 'targeted upskilling' and 'CPD'",
                    "improved the guidance on eligibility",
                    "created new guidance to provide more information and help on the service",
                    "replaced the 'claim items' terminology with just 'claims'",
                    "combined the 2 flows to add a new claim by learner or event into a single flow",
                    "made use of the GDS 'add a new item' pattern when adding multiple learners to a claim",
                    "introduced new confirmation pages and emails",
                    "split the 'add evidence' flow from the 'add claim' flow",

                ],
                "aims": [
                    "if we could set clear and realistic expectations about the service from its name and initial guidance",
                    "whether our new ways of describing the 2 fundings pots made sense to users",
                    "if the 'start a new claim' workflow is usable, intuitive and not too time consuming when adding multiple learners",
                    "how to support users to add high quality evidence to claims",
                    "whether the confirmation screens provide reassurance of what users have done on the system"
                ],
                "learnt": [
                    "the descriptions of the 2 funding pots were better received (though 'direct care' isn't specific enough as it also relates to nurses and AHPs)",
                    "many users incorrectly expected the service to allow them to book the training rather than just claim reimbursement",
                    "users are much happier thinking about 'claims' rather than 'claim items'",
                    "the combined 'start a new claim' flow generally worked well, though many users felt there were some unecessary steps (for instance, having to view course and learner details when adding them)",
                    "users were often unclear what the learner ID referred to and whether it related to their internal systems",
                    "the confirmation emails were seen as helpful",
                    "the process of adding evidence was confusing as users were unsure what they needed to upload and when",
                    "in general, as users went through the flow to start a claim they seemed unsure about how far through the process they were, what happens next and whether their progress had been saved"
                ]
            },
            {
                "versionNo": "3",
                "status": "retired",
                "tested": "w/c 27 November 2023",
                "created": [
                    "PLEASE NOTE: This version does not include dynamic data that carries through transactions.",
                    "added the 'start now' and associated eligibility guidance screens",
                    "introduced a dummy 'sign in' screen",
                    "simplified the claim item status options from 9 down to 5 so that they could be used as tabs on the 'manage claim items' screen",
                    "allowed the search filters to be toggled on or off (though this is not fully working at the moment)",
                    "added 'item ID' column to the claim items tables",
                    "introduced the workflows for starting a new claim item, either by learner or event"
                ],
                "aims": [
                    "the mental models users have around training and reimbursement",
                    "if the start page sets reasonable expectations of the service and explains eligibility",
                    "whether users understand the terms 'CPD' and 'targeted upskilling' and if this differentiation is helpful",
                    "whether the 'start a new claim' workflow is suitable and the options of adding by learner or event are needed (half the participants tested the learner flow and the other half the event flow)"
                ],
                "learnt": [
                    "many users instinctively compared our service to their experience of the Workforce Development Fund",
                    "eligibility is a key concern of users",
                    "it is important that the language in the service does not reinforce the perception that registered staff are more important than non-registered",
                    "there was concern around the potential for duplication of claims, especially for learners with the same name",
                    "no-one had heard of 'targeted upskilling' and the term 'claim items' caused considerable confusion",
                    "the claim item statuses were well liked and understood",
                    "the concept of an 'L&D event' was popular, though the terminology was less so",
                    "the different types of evidence weren't understood, or the reasons they were needed",
                    "the wording of the button on the check your answers page was confusing as people thought it would add further claims rather than finishing the current one"
                ]
            },
            {
                "versionNo": "2",
                "status": "retired",
                "tested": "Untested",
                "created": [
                    "simplified the 'claim items' screen by removing the CPD/TU split",
                    "introduced the concept of claim item statuses through the 'in progress' and 'submitted' tabs",
                    "added dummy claim item data",
                    "added the 'view learner' option"
                ],
                "aims": [
                    "N/A"
                ],
                "learnt": [
                    "This second iteration, still just for internal use, removed some of the complexity from v1 and developed the core functions further. The team realised that the range of statuses was potentially overcomplicated and how they were grouped onto two tabs meant that the precense of these statuses against each claim items was visually overwhelming."
                ]
            },
            {
                "versionNo": "1",
                "status": "retired",
                "tested": "Untested",
                "created": [
                    "created the 'claim items' screen to start exploring a way to represent and manage claims",
                    "split CPD and TU claim items into separate tabs",
                    "introduced filter options including the ability to group claim items by learner or L&D event"
                ],
                "aims": [
                    "N/A"
                ],
                "learnt": [
                    "This first prototype was meant to facilitate discussion between the designers on the team. What we realised is that splitting items by CPD/TU and by learner/event was introducing too much complexity without evidence to back this up."
                ]
            }
        ],
        "processingCurrent": "v3",
        "processingVersions": [
            {
                "versionNo": "3",
                "status": "dev",
                "tested": "Untested",
                "created": [
                    "TODO"
                ],
                "aims": [
                    "TODO"
                ],
                "learnt": [
                    "TODO"
                ]
            },
            {
                "versionNo": "2",
                "status": "retired",
                "tested": "Untested",
                "created": [
                    "TODO"
                ],
                "aims": [
                    "TODO"
                ],
                "learnt": [
                    "TODO"
                ]
            },
            {
                "versionNo": "1",
                "status": "retired",
                "tested": "w/c 22 April 2024",
                "created": [
                    "TODO"
                ],
                "aims": [
                    "TODO"
                ],
                "learnt": [
                    "TODO"
                ]
            }
        ]
    }
}

