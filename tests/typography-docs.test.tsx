import React from 'react';
import {render} from '@testing-library/react';
import {it,expect} from 'vitest';
import {TypographyExample} from '../apps/docs/typography-example';
it('keeps typography demo sections compact despite global documentation section margins',()=>{
  const {container}=render(<TypographyExample/>);
  const sections=container.querySelectorAll('section');
  expect(sections).toHaveLength(5);
  for(const section of sections) expect(section).toHaveStyle({margin:0});
});
