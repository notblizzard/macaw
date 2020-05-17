import React, { useContext } from "react";
import moment, { Moment } from "moment";
import { Tooltip, makeStyles, Box } from "@material-ui/core";
import DarkModeContext from "../DarkMode";

interface StyleProps {
  darkMode: boolean;
}
const useStyles = makeStyles(() => ({
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  moment: (props: StyleProps) => ({
    color: props.darkMode ? "#b8c5d9bd" : "#070b0fbd",
  }),
}));
interface MomentProps {
  time: string;
  profile: boolean;
}
const Moment = ({ time, profile }: MomentProps): JSX.Element => {
  const darkMode = useContext(DarkModeContext);
  const classes = useStyles({ darkMode });
  const timeFormatted = moment(time).format("hh - MMMM DD YYYY");
  const date: string = profile
    ? moment(time).local().format("MMMM YYYY")
    : moment(time).local().fromNow();

  return (
    <Tooltip className={classes.moment} title={timeFormatted} arrow interactive>
      <Box component="span">{date}</Box>
    </Tooltip>
  );
};

//Moment.propTypes = {
// time: PropTypes.string,
// profile: PropTypes.bool,
//};

export default Moment;
