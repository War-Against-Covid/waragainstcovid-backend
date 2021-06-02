/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-restricted-syntax */

// eslint-disable-next-line no-use-before-define
import React from 'react';
import { Badge } from '@admin-bro/design-system';
import { BasePropertyProps } from 'admin-bro';
import { unflatten } from 'flat';

export default (props: BasePropertyProps) => {
    const { record, property } = props;
    let { params } = record;
    const { listName, breakAfter = 2 } = property.custom;
    params = unflatten(params);
    const list = params[listName as string] as string[];

    const jsxs = [];
    let indx = 0;
    for (const elem of list) {
        indx += 1;
        jsxs.push(<Badge variant="info">{elem}</Badge>);
        if (indx % breakAfter === 0) {
            jsxs.push(<br />);
        }
    }
    return <>{jsxs}</>;
};
