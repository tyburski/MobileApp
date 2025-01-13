type Country = {
  code: string;
  neighbors: string[];
};

const krajeUE: Country[] = [
  {code: 'AT', neighbors: ['DE', 'CZ', 'SK', 'HU', 'SI', 'IT', 'CH', 'LI']},
  {code: 'BE', neighbors: ['FR', 'LU', 'NL', 'DE', 'GB']},
  {code: 'BG', neighbors: ['GR', 'RO', 'TR', 'RS', 'MK']},
  {code: 'HR', neighbors: ['SI', 'HU', 'RS', 'BA', 'ME', 'IT']},
  {code: 'CY', neighbors: ['GR']},
  {code: 'CZ', neighbors: ['PL', 'DE', 'AT', 'SK']},
  {code: 'DK', neighbors: ['DE', 'SE', 'NO']},
  {code: 'EE', neighbors: ['LV', 'RU', 'FI', 'SE']},
  {code: 'FI', neighbors: ['SE', 'NO', 'EE', 'RU']},
  {
    code: 'FR',
    neighbors: ['ES', 'BE', 'LU', 'DE', 'CH', 'IT', 'AD', 'MC', 'GB', 'IE'],
  },
  {code: 'GR', neighbors: ['AL', 'MK', 'BG', 'TR', 'IT', 'CY']},
  {code: 'ES', neighbors: ['PT', 'FR', 'AD', 'IT', 'MA']},
  {code: 'NL', neighbors: ['BE', 'DE', 'GB']},
  {code: 'IE', neighbors: ['GB']},
  {code: 'LT', neighbors: ['LV', 'PL', 'BY', 'RU', 'SE']},
  {code: 'LU', neighbors: ['BE', 'FR', 'DE']},
  {code: 'LV', neighbors: ['EE', 'LT', 'RU', 'BY', 'SE']},
  {code: 'MT', neighbors: ['IT']},
  {
    code: 'DE',
    neighbors: ['DK', 'NL', 'BE', 'LU', 'FR', 'CH', 'AT', 'CZ', 'PL', 'SE'],
  },
  {code: 'PL', neighbors: ['DE', 'CZ', 'SK', 'UA', 'BY', 'LT', 'RU', 'SE']},
  {code: 'PT', neighbors: ['ES']},
  {code: 'RO', neighbors: ['BG', 'HU', 'RS', 'UA', 'MD']},
  {code: 'SK', neighbors: ['PL', 'CZ', 'AT', 'HU', 'UA']},
  {code: 'SI', neighbors: ['AT', 'IT', 'HU', 'HR']},
  {code: 'SE', neighbors: ['NO', 'FI', 'DK', 'DE', 'LT', 'LV', 'EE', 'PL']},
  {code: 'HU', neighbors: ['AT', 'SK', 'UA', 'RO', 'RS', 'HR', 'SI']},
  {code: 'IT', neighbors: ['FR', 'CH', 'AT', 'SI', 'HR', 'MT', 'GR']},
  {code: 'CH', neighbors: ['DE', 'FR', 'IT', 'AT', 'LI']},
  {code: 'NO', neighbors: ['SE', 'FI', 'DK', 'RU']},
  {code: 'AL', neighbors: ['ME', 'GR', 'MK', 'RS']},
  {code: 'BA', neighbors: ['HR', 'ME', 'RS']},
  {code: 'BY', neighbors: ['PL', 'LT', 'LV', 'UA', 'RU']},
  {code: 'MD', neighbors: ['RO', 'UA']},
  {code: 'ME', neighbors: ['HR', 'RS', 'BA', 'AL']},
  {code: 'MK', neighbors: ['GR', 'AL', 'BG', 'RS']},
  {code: 'RS', neighbors: ['HU', 'RO', 'BG', 'MK', 'AL', 'ME', 'BA']},
  {code: 'TR', neighbors: ['GR', 'BG']},
  {code: 'UA', neighbors: ['PL', 'SK', 'HU', 'RO', 'MD', 'BY', 'RU']},
  {code: 'RU', neighbors: ['EE', 'LV', 'LT', 'PL', 'BY', 'UA', 'FI', 'NO']},
  {code: 'AD', neighbors: ['FR', 'ES']},
  {code: 'MC', neighbors: ['FR']},
  {code: 'LI', neighbors: ['CH', 'AT']},
  {code: 'GB', neighbors: ['IE', 'BE', 'NL', 'FR']},
  {code: 'MA', neighbors: ['ES']},
];

export const getNeighbors = (countryCode: string): string[] | undefined => {
  const country = krajeUE.find(kraj => kraj.code === countryCode);
  return country?.neighbors;
};
