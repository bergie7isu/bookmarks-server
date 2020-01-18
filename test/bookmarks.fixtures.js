function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Website 1',
            url: 'http://www.website1.com',
            description: 'Cool website #1',
            rating: 1
        },
        {
            id: 2,
            title: 'Website 2',
            url: 'http://www.website2.com',
            description: 'Cool website #2',
            rating: 2
        },
        {
            id: 3,
            title: 'Website 3',
            url: 'http://www.website3.com',
            description: 'Cool website #3',
            rating: 3
        },
        {
            id: 4,
            title: 'Website 4',
            url: 'http://www.website4.com',
            description: 'Cool website #4',
            rating: 4
        },
        {
            id: 5,
            title: 'Website 5',
            url: 'http://www.website5.com',
            description: 'Cool website #5',
            rating: 5
        }
    ];
};

function makeMaliciousBookmark() {
    const maliciousBookmark = {
        id: 911,
        title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        url: 'https://www.hackers.com',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        rating: 1
    };
    const expectedBookmark = {
        ...maliciousBookmark,
        title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    };
    return {
        maliciousBookmark,
        expectedBookmark
    };
};

module.exports = { makeBookmarksArray, makeMaliciousBookmark };