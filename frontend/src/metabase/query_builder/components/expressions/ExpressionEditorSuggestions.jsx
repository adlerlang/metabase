import React from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import Popover from "metabase/components/Popover";
import { ListItemStyled, UlStyled } from "./ExpressionEditorSuggestions.styled";

import { isObscured } from "metabase/lib/dom";

const SuggestionSpan = ({ suggestion, isHighlighted }) => {
  const className = cx("text-brand text-bold hover-child", {
    "text-white bg-brand": isHighlighted,
  });

  return suggestion.range ? (
    <span>
      {suggestion.name.slice(0, suggestion.range[0])}
      <span className={className}>
        {suggestion.name.slice(suggestion.range[0], suggestion.range[1])}
      </span>
      {suggestion.name.slice(suggestion.range[1])}
    </span>
  ) : (
    suggestion.name
  );
};

SuggestionSpan.propTypes = {
  suggestion: PropTypes.object,
  isHighlighted: PropTypes.bool,
};

export default class ExpressionEditorSuggestions extends React.Component {
  static propTypes = {
    suggestions: PropTypes.array,
    onSuggestionMouseDown: PropTypes.func, // signature is f(index)
    highlightedIndex: PropTypes.number.isRequired,
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      (prevProps && prevProps.highlightedIndex) !== this.props.highlightedIndex
    ) {
      if (this._selectedRow && isObscured(this._selectedRow)) {
        this._selectedRow.scrollIntoView({ block: "nearest" });
      }
    }
  }

  // when a given suggestion is clicked
  onSuggestionMouseDown(event, index) {
    event.preventDefault();
    event.stopPropagation();

    this.props.onSuggestionMouseDown && this.props.onSuggestionMouseDown(index);
  }

  render() {
    const { suggestions, highlightedIndex } = this.props;

    if (!suggestions.length) {
      return null;
    }

    return (
      <Popover
        className="not-rounded border-dark"
        hasArrow={false}
        tetherOptions={{
          attachment: "top left",
          targetAttachment: "bottom left",
        }}
        sizeToFit
      >
        <UlStyled>
          {suggestions.map((suggestion, i) => {
            const isHighlighted = i === highlightedIndex;

            return (
              <React.Fragment key={`suggestion-${i}`}>
                <ListItemStyled
                  onMouseDownCapture={e => this.onSuggestionMouseDown(e, i)}
                  isHighlighted={isHighlighted}
                >
                  <SuggestionSpan
                    suggestion={suggestion}
                    isHighlighted={isHighlighted}
                  />
                </ListItemStyled>
              </React.Fragment>
            );
          })}
        </UlStyled>
      </Popover>
    );
  }
}
