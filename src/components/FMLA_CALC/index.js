// @flow
import React, {Component} from 'react';
import moment from 'moment';
import DayPicker from 'react-day-picker';

import 'react-day-picker/lib/style.css';

const overlayStyle = {
  position: 'absolute',
  background: 'white',
  boxShadow: '0 2px 5px rgba(0, 0, 0, .15)'
};

export default class InputFieldOverlay extends Component {
  constructor(props: any) {
    super(props);

    const self: Object = this;
    self.handleDayClick = this.handleDayClick.bind(this);
    self.handleInputChange = this.handleInputChange.bind(this);
    self.handleInputFocus = this.handleInputFocus.bind(this);
    self.handleInputBlur = this.handleInputBlur.bind(this);
    self.handleContainerMouseDown = this.handleContainerMouseDown.bind(this);
  }

  state = {
    showOverlay: false,
    benefitStartDate: '',
    childBirth: false,
    childBirthKind: 0,
    stdKind: 0,
    selectedDay: null
  };
  // illness | injury STD Other
  componentWillUnmount() {
    clearTimeout(this.clickTimeout);
  }

  input = null;
  daypicker = null;
  clickedInside = false;
  clickTimeout = null;

  handleContainerMouseDown() {
    this.clickedInside = true;
    // The input's onBlur method is called from a queue right after onMouseDown event.
    // setTimeout adds another callback in the queue, but is called later than onBlur event
    this.clickTimeout = setTimeout(
      () => {
        this.clickedInside = false;
      },
      0
    );
  }

  handleInputFocus() {
    this.setState({
      showOverlay: true
    });
  }

  handleInputBlur() {
    const showOverlay = this.clickedInside;

    this.setState({
      showOverlay
    });

    // Force input's focus if blur event was caused by clicking on the calendar
    if (showOverlay && this.input) {
      this.input.focus();
    }
  }

  handleInputChange = ({target}: SyntheticInputEvent) => {
    const momentDay = moment(target.value, 'L', true);
    if (momentDay.isValid()) {
      this.setState(
        {
          selectedDay: momentDay.toDate(),
          benefitStartDate: ''
        },
        () => {
          if (this.daypicker) {
            this.daypicker.showMonth(this.state.selectedDay);
          }
        }
      );
    } else {
      this.setState({benefitStartDate: '', selectedDay: null});
    }
  };

  handleDayClick(day: any) {
    console.log(day, 'what is day?');
    this.setState({
      benefitStartDate: moment(day).format('L'),
      selectedDay: day,
      showOverlay: false
    });
    if (this.input) {
      this.input.blur();
    }
  }

  render() {
    console.log(this.state, 'state render');
    const {benefitStartDate, childBirth, childBirthKind, stdKind} = this.state;
    let shortTimeDisabilityStart, shortTimeDisabilityEnd, fmlaEndDate;
    if (benefitStartDate && stdKind !== 1) {
      shortTimeDisabilityStart = moment(benefitStartDate).add(14, 'd').format('L');
      fmlaEndDate = moment(benefitStartDate).add(12, 'w').format('L');
    } else if (benefitStartDate && stdKind !== 0) {
      shortTimeDisabilityStart = moment(benefitStartDate).add(7, 'd').format('L');
      fmlaEndDate = moment(benefitStartDate).add(12, 'w').format('L');
    }

    if (childBirth && shortTimeDisabilityStart) {
      if (childBirthKind === 0) {
        shortTimeDisabilityEnd = moment(shortTimeDisabilityStart).add(4, 'w').format('L');
      } else {
        shortTimeDisabilityEnd = moment(shortTimeDisabilityStart).add(6, 'w').format('L');
      }
    }

    return (
      <div>
        <h3>Benefit Dates Adjustments Calculator</h3>
        <div onMouseDown={this.handleContainerMouseDown}>
          <input
            type="text"
            ref={el => {
              this.input = el;
            }}
            placeholder="DD/MM/YYYY"
            value={this.state.benefitStartDate}
            onChange={this.handleInputChange}
            onFocus={this.handleInputFocus}
            onBlur={this.handleInputBlur}
          />
          {this.state.showOverlay &&
            <div style={{position: 'relative'}}>
              <div style={overlayStyle}>
                <DayPicker
                  ref={el => {
                    this.daypicker = el;
                  }}
                  initialMonth={this.state.selectedDay || undefined}
                  onDayClick={this.handleDayClick}
                  selectedDays={this.state.selectedDay}
                />
              </div>
            </div>}
        </div>

        <div>FMLA Start date: {benefitStartDate ? benefitStartDate : 'Select Date'}</div>
        <div>FMLA End date: {fmlaEndDate ? fmlaEndDate : 'Select Date'}</div>
        <hr />
        <div>Child Birth: {childBirth ? 'true' : 'false'}</div>

        {childBirth
          ? <div>Child Birth Kind: {childBirthKind === 0 ? 'natural' : 'Cesarean'}</div>
          : null}

        {benefitStartDate
          ? <div className="">
              <button type="button" onClick={this.doSetGroupValue.bind(this, 'childBirth', true)}>
                Child Birth
              </button>
              <button type="button" onClick={this.doSetGroupValue.bind(this, 'childBirth', false)}>
                Other
              </button>
            </div>
          : null}

        {childBirth
          ? <div className="">
              <button type="button" onClick={this.doSetGroupValue.bind(this, 'childBirthKind', 1)}>
                Cesarean
              </button>
              <button type="button" onClick={this.doSetGroupValue.bind(this, 'childBirthKind', 0)}>
                Natural
              </button>
            </div>
          : <div className="">
              <button type="button" onClick={this.doSetGroupValue.bind(this, 'stdKind', 0)}>
                Illness
              </button>
              <button type="button" onClick={this.doSetGroupValue.bind(this, 'stdKind', 1)}>
                Injury
              </button>
            </div>}

        <hr />
        {shortTimeDisabilityStart
          ? <div>
              <div>
                Short Time Disability Start date:
                {' '}
                {shortTimeDisabilityStart ? shortTimeDisabilityStart : null}
              </div>
              <div>
                Short Time Disability End date:
                {' '}
                {shortTimeDisabilityEnd ? shortTimeDisabilityEnd : null}
              </div>
            </div>
          : null}

      </div>
    );
  }

  doSetGroupValue(kind: string, val: number | boolean) {
    console.log(kind, val, 'set Values');
    this.setState({[kind]: val});
  }
}
