import React from "react";
import moment, { Moment } from "moment";
import { Tooltip } from "@material-ui/core";
import PropTypes from "prop-types";

interface MomentProps {
  time: string;
  profile: boolean;
}
const Moment = ({ time, profile }: MomentProps): JSX.Element => {
  const timeFormatted = moment(time).format("hh - MMMM DD YYYY");
  const date: string = profile
    ? moment(time).local().format("MMMM YYYY")
    : moment(time).local().fromNow();

  return (
    <Tooltip className={"grey"} title={timeFormatted} arrow interactive>
      <span>{date}</span>
    </Tooltip>
  );
};

//Moment.propTypes = {
// time: PropTypes.string,
// profile: PropTypes.bool,
//};

export default Moment;
