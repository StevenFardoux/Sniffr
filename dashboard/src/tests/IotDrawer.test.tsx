import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import IotDrawer from '../components/IotDrawer';
import IGroup from '../interfaces/IGroup';
import IDevices from '../interfaces/IDevices';

// Mock of react-select to simplify the rendering
jest.mock('react-select', () => (props: any) => (
  <select
    data-testid="react-select"
    multiple={props.isMulti}
    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
      props.onChange(selected.map((v: any) => ({ value: v, label: v })));
    }}
  >
    {props.options.map((opt: any) => (
      <option key={opt.label} value={JSON.stringify(opt.value)}>
        {opt.label}
      </option>
    ))}
  </select>
));

// Mock of useGroups to provide fake groups
const mockUseGroups = jest.fn();
jest.mock('../contexts/GroupContext', () => ({
  useGroups: () => mockUseGroups(),
}));

/**
 * Creation of fake data
 */
const group: IGroup = { _id: 'g1', Name: 'Groupe 1', Description: '' };
const iotDevice: IDevices = {
  _id: 'd1',
  IMEI: '123456',
  Name: 'Capteur',
  BatterieStatus: 80,
  DateLastConn: new Date(),
  DateRegister: new Date(),
  Group_Id: [group],
};

/**
 * Unit test for <IotDrawer />
 */

describe('<IotDrawer />', () => {
  beforeEach(() => {
    mockUseGroups.mockReturnValue({ groups: [group] });
  });

  it(`ne rend rien si aucune donnée IoT n'est fournie`, () => {
    const { container } = render(
      <IotDrawer iot={null} onClose={jest.fn()} onSave={jest.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  it(`affiche le nom de l'appareil et déclenche onSave avec les valeurs modifiées`, () => {
    const handleSave = jest.fn();

    render(
      <IotDrawer iot={iotDevice} onClose={jest.fn()} onSave={handleSave} />
    );

    const input = screen.getByDisplayValue(/Capteur/i) as HTMLInputElement;
    expect(input).toBeInTheDocument();

    act(() => {
      fireEvent.change(input, { target: { value: 'Capteur V2' } });
    });

    fireEvent.click(screen.getByRole('button', { name: /enregistrer/i }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({ Name: 'Capteur V2' })
    );
  });
}); 