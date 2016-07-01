import React, {PropTypes} from 'react';
import {findDOMNode} from 'react-dom';
import {Deburr} from 'deburr';
import {RangeHighlight} from 'react-substring-highlighter';

const {any, array, string, number, bool, func} = React.PropTypes;

export class FilteredList extends React.Component {

  static propTypes = {
    className: any,
    values: array.isRequired,
    filter: string,
    teaserLength: number,
    showTeaserForEmptyFilter: bool,
    expandable: bool,
    highlight: number,
    onSelectValue: func.isRequired
  };
  static defaultProps = {
    filter: '',
    teaserLength: 10,
    showTeaserForEmptyFilter: true,
    expandable: true,
    highlight: 1,
    onSelectValue: index => {}
  };

  state = {
    expanded: false
  };

  componentWillReceiveProps (props) {
    this.setState({expanded: this.state.expanded && this.props.filter == props.filter});
  }

  onExpand = e => {
    e.preventDefault();

    this.setState({expanded: true}, () => {
      findDOMNode(this)
        .childNodes[this.props.teaserLength]
        .querySelector('a')
        .focus()
    });
  };

  render () {
    const {className} = this.props;

    var total = 0; // Total number of matched items.
    var filter = this.props.filter.toLowerCase(),
        values = this.props.values,
        count = Math.max(this.props.highlight, 1),
        items = [];

    if (values != null) {
      if (filter) {
        values.forEach((val, i) => {
          var ranges = new Deburr(String(val).toLowerCase()).lookupAll(filter, 0, count);
          if (ranges.length == 0) {
            return; // Value did not conform filter.
          }
          total++;
          if (!this.state.expanded && total > this.props.teaserLength) {
            return; // Teaser cut-off reached.
          }
          var content;
          if (this.props.highlight > 0) {
            content = <RangeHighlight value={val} ranges={ranges}/>;
          } else {
            content = val;
          }
          items.push(
            <li key={val} className="filtered-list__item">
              <a href="javascript:"
                 onClick={e => this.props.onSelectValue(i)}>
                {content}
              </a>
            </li>
          );
        });
      } else {
        if (this.props.showTeaserForEmptyFilter) {
          total = values.length;
          values.slice(0, this.props.teaserLength).forEach((val, i) => {
            if (val) {
              items.push(
                <li key={val} className="filtered-list__item">
                  <a href="javascript:"
                     onClick={e => this.props.onSelectValue(i)}>
                    {val}
                  </a>
                </li>
              );
            }
          });
        }
      }

      // Render teaser showing number of non-displayed items.
      var tail = total - items.length;
      if (tail > 0) {
        var teaser;
        if (this.props.expandable) {
          teaser = (
            <a href="javascript:"
               onClick={this.onExpand}>
              Show more
              {/*lang('Show {count} more', {count: tail})*/}
            </a>
          );
        } else {
          teaser = 'Found more'; //lang('Found {count} more', {count: tail});
        }
        items.push(<li key="teaser" className="filtered-list__teaser">{teaser}</li>);
      }
    }
    if (total == 0) {
      items = this.props.placeholder;
    }
    let classNames = ['filtered-list'];
    if (className) {
      classNames = classNames.concat(className);
    }
    return (
      <ul className={classNames.join(' ')}
          role="listbox">
        {items}
      </ul>
    );
  }
}
