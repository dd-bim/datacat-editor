import React from 'react';

test('vars are available during testing', () => {
    expect(process.env.REACT_APP_TITLE).not.toBeFalsy();
    expect(process.env.REACT_APP_VERSION).not.toBeFalsy();
});
