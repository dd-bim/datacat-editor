import React from 'react';
import {render} from '@testing-library/react';
import AppTitle from "./AppTitle";

test('renders title', () => {
    const {getByText} = render(<AppTitle/>);
    const exp = new RegExp(process.env.REACT_APP_TITLE!, "i");
    const linkElement = getByText(exp);
    expect(linkElement).toBeInTheDocument();
});
