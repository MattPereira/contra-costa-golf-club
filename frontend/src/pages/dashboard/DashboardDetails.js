// External imports
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { styled } from "@mui/system";
//prettier-ignore
import { Grid, Box, Tab, Button, Tabs } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";

// Internal imports
import PageHero from "../../components/PageHero";
import Modal from "../../components/Modal";
import CcgcApi from "../../api/api";
import LoadingSpinner from "../../components/LoadingSpinner";

import dashboardHero from "../../assets/dashboard.jpg";
import { Table } from "react-bootstrap";

/** DASHBOARD PAGE
 *
 *  Allows admin users to edit and delte any course or tournament
 *
 * Router -> Dashboard -> { CoursesDash, TournamentsDash }
 */

export default function Dashboard() {
  const [value, setValue] = useState(0);

  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState("success.main");
  const [message, setMessage] = useState("This is the modal message!");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const StyledTab = styled(Tab)(({ theme }) => ({
    fontFamily: "Cubano",
    fontSize: "1.15rem",
    color: "white",
  }));

  return (
    <Box>
      <PageHero title="Dashboard" backgroundImage={dashboardHero} />

      <Box sx={{ bgcolor: "black", py: 1 }}>
        <Tabs
          centered
          textColor="secondary"
          indicatorColor="secondary"
          value={value}
          onChange={handleChange}
          aria-label="lab API tabs example"
        >
          <StyledTab label="Tournaments" />
          <StyledTab label="Courses" />
          <StyledTab label="Members" />
        </Tabs>
      </Box>
      <Grid container justifyContent="center" sx={{ mb: 5 }}>
        <Grid item xs={12} md={8} lg={6}>
          <TabPanel value={value} index={0}>
            <TournamentsTab
              setMessage={setMessage}
              setOpen={setOpen}
              setVariant={setVariant}
            />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <CoursesTab
              setMessage={setMessage}
              setOpen={setOpen}
              setVariant={setVariant}
            />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <MembersTab
              setMessage={setMessage}
              setOpen={setOpen}
              setVariant={setVariant}
            />
          </TabPanel>
        </Grid>
      </Grid>

      <Modal
        open={open}
        setOpen={setOpen}
        message={message}
        variant={variant}
      />
    </Box>
  );
}

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function TournamentsTab({ setMessage, setVariant, setOpen }) {
  const [tournaments, setTournaments] = useState(null);

  const handleTournamentDelete = async (date) => {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

    try {
      await CcgcApi.deleteTournament(date);
      setTournaments(tournaments.filter((t) => t.date !== date));
      setVariant("success.dark");
      setMessage(`Tournament on ${formattedDate} successfully deleted!`);
      setOpen(true);
    } catch (err) {
      setVariant("error.dark");
      setMessage(
        `Deletion of tournament on ${formattedDate} not allowed because "${err[0]}"`
      );
      setOpen(true);
      console.log("THE ERROR", err);
    }
  };

  /* On component mount, fetch all tournaments from API */
  useEffect(function getTournamentData() {
    async function fetchAllTournaments() {
      let tournaments = await CcgcApi.getTournaments();
      setTournaments(tournaments);
    }

    fetchAllTournaments();
  }, []);

  if (!tournaments) return <LoadingSpinner />;
  console.log("TOURNAMENTS", tournaments);

  return (
    <Box>
      <Box sx={{ textAlign: "center" }}>
        <Button
          component={Link}
          to="/tournaments/create"
          variant="contained"
          sx={{ my: 3, borderRadius: "30px" }}
        >
          <AddCircleOutlineIcon sx={{ mr: 1 }} /> Tournament
        </Button>
      </Box>

      <Table striped bordered>
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Course</th>
            <th className="text-center">
              <BorderColorIcon />
            </th>
            <th className="text-center">
              <RemoveCircleIcon />
            </th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((t) => (
            <tr key={t.date}>
              <th>
                {new Date(t.date).toLocaleDateString("en-Us", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                })}
              </th>
              <td>{t.courseName.split(" ").slice(0, 2).join(" ")}</td>
              <td className="text-center">
                <Button
                  component={Link}
                  to={`/tournaments/update/${t.date}`}
                  sx={{
                    minWidth: "auto",
                    p: 0.5,
                    "&:hover": { color: "primary.dark" },
                  }}
                >
                  <BorderColorIcon />
                </Button>
              </td>
              <td className="text-center">
                <Button
                  onClick={() => handleTournamentDelete(t.date)}
                  sx={{
                    minWidth: "auto",
                    p: 0.5,
                    color: "error.main",
                    "&:hover": { color: "error.dark" },
                  }}
                >
                  <RemoveCircleIcon />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

function CoursesTab({ setMessage, setVariant, setOpen }) {
  const [courses, setCourses] = useState(null);

  const handleCourseDelete = async (handle) => {
    try {
      await CcgcApi.deleteCourse(handle);
      setCourses(courses.filter((c) => c.handle !== handle));
      setVariant("success.dark");
      setMessage(`Course ${handle} successfully deleted!`);
      setOpen(true);
    } catch (err) {
      setVariant("error.dark");
      setMessage(
        `Deletion of ${handle} not allowed since a tournament has been played at this course!`
      );
      setOpen(true);
      console.log("THE ERROR", err);
    }
  };

  /* On component mount, load tournaments from API */
  useEffect(function getCourseData() {
    async function fetchAllCourses() {
      let courses = await CcgcApi.getCourses();
      setCourses(courses);
    }

    fetchAllCourses();
  }, []);

  if (!courses) return <LoadingSpinner />;
  console.log("COURSES", courses);

  return (
    <Box>
      <Box sx={{ textAlign: "center" }}>
        <Button
          component={Link}
          to="/courses/create"
          variant="contained"
          color="success"
          sx={{ my: 3, borderRadius: "30px" }}
        >
          <AddCircleOutlineIcon sx={{ mr: 1 }} />
          Golf Course
        </Button>
      </Box>

      <Table bordered striped responsive>
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Rtg</th>
            <th>Slp</th>
            <th className="text-center">
              <BorderColorIcon />
            </th>
            <th className="text-center">
              <RemoveCircleIcon />
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.handle}>
              <th>{c.name.split(" ").slice(0, 2).join(" ")}</th>
              <td>{c.rating}</td>
              <td>{c.slope}</td>
              <td className="text-center">
                <Button
                  component={Link}
                  to={`/courses/update/${c.handle}`}
                  sx={{
                    minWidth: "auto",
                    p: 0.5,
                    "&:hover": { color: "primary.dark" },
                  }}
                >
                  <BorderColorIcon />
                </Button>
              </td>
              <td className="text-center">
                <Button
                  onClick={() => handleCourseDelete(c.handle)}
                  sx={{
                    minWidth: "auto",
                    p: 0.5,
                    color: "error.main",
                    "&:hover": { color: "error.dark" },
                  }}
                >
                  <RemoveCircleIcon />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}

function MembersTab({ setMessage, setVariant, setOpen }) {
  const [members, setMembers] = useState(null);

  const handleMemberDelete = async (username) => {
    try {
      await CcgcApi.deleteMember(username);
      setMembers(members.filter((m) => m.username !== username));
      setVariant("success.dark");
      setMessage(`Member ${username} successfully deleted!`);
      setOpen(true);
    } catch (err) {
      setVariant("error.dark");
      setMessage("Cannot delete a member if they have scores in the database!");
      setOpen(true);
      console.log("THE ERROR", err);
    }
  };

  /* On component mount, load tournaments from API */
  useEffect(function getMemberData() {
    async function fetchAllMembers() {
      let members = await CcgcApi.getMembers();
      setMembers(members);
    }
    fetchAllMembers();
  }, []);

  if (!members) return <LoadingSpinner />;

  console.log("MEMBERS", members);

  return (
    <Box>
      <Box sx={{ textAlign: "center" }}>
        <Button
          component={Link}
          to="/members/create"
          variant="contained"
          color="warning"
          sx={{ my: 3, borderRadius: "30px" }}
        >
          <AddCircleOutlineIcon sx={{ mr: 1 }} /> Club Member
        </Button>
      </Box>

      <Table bordered striped responsive>
        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th className="text-center">
              <BorderColorIcon />
            </th>
            <th className="text-center">
              <RemoveCircleIcon />
            </th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.username}>
              <th>
                {m.firstName} {m.lastName}
              </th>
              <td className="text-center">
                <Button
                  component={Link}
                  to={`/members/update/${m.username}`}
                  sx={{
                    minWidth: "auto",
                    p: 0.5,
                    "&:hover": { color: "primary.dark" },
                  }}
                >
                  <BorderColorIcon />
                </Button>
              </td>
              <td className="text-center">
                <Button
                  onClick={() => handleMemberDelete(m.username)}
                  sx={{
                    minWidth: "auto",
                    p: 0.5,
                    color: "error.main",
                    "&:hover": { color: "error.dark" },
                  }}
                >
                  <RemoveCircleIcon />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
}
