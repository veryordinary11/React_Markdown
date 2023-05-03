import { useRef, FormEvent, useState } from "react";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CreatableReactSelect from "react-select/creatable";
import { NoteData, Tag } from "./App";
import { v4 as uuidV4 } from "uuid";

type NoteFormProps = {
  onSubmit: (data: NoteData) => void;
  onAddTag: (tag: Tag) => void;
  availableTags: Tag[];
} & Partial<NoteData>;
//Because when we use the NoteForm in 'Edit', we need to pass the previous data
//to the form, however, when we use the NoteForm in 'NewNote', we don't need to
//pass the previous data to the form, so we use Partial<NoteData> to make the data optional

export function NoteForm({
  onSubmit,
  onAddTag,
  availableTags,
  title = "",
  markdown = "",
  tags = [],
}: NoteFormProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const markdownRef = useRef<HTMLTextAreaElement>(null);
  //titleRef and markdownRef are used to get the value of the title and markdown
  //from the form, then it could pass the value to the onSubmit function

  //I don't want the change of title and markdown to trigger a re-render,
  //and I want to store the value of them between re-renders, so I use useRef

  const [selectedTags, setSelectedTags] = useState<Tag[]>(tags);
  //selectedTags is used to store the tags that are selected currently by the user

  const navigate = useNavigate();
  //useNavigate is a hook that allows us to navigate to a different route

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    onSubmit({
      title: titleRef.current!.value, //the '!' is used to tell TypeScript that the value is not null
      markdown: markdownRef.current!.value, // because title and markdown are required, so they cannot be null
      tags: selectedTags,
    });
    //call the onSubmit function that is passed to the NoteForm component as a prop
    //and pass the data from the form to the function including the title, markdown and tags

    navigate("..");
    //when the form is submitted, we want to navigate back to the previous page
  }

  return (
    <Form onSubmit={handleSubmit}>
      <Stack gap={4}>
        <Row>
          <Col>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control ref={titleRef} required defaultValue={title} />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="tags">
              <Form.Label>Tags</Form.Label>
              <CreatableReactSelect
                onCreateOption={(label) => {
                  const newTag = { id: uuidV4(), label }; //uuidV4() is used to generate a random id
                  onAddTag(newTag);
                  setSelectedTags((prev) => [...prev, newTag]);
                }}
                //onChange will not be triggered when the user creates a new tag

                value={selectedTags.map((tag) => {
                  return { label: tag.label, value: tag.id };
                })}
                options={availableTags.map((tag) => {
                  return { label: tag.label, value: tag.id };
                })}
                //the label/value pair is required by the CreatableReactSelect component
                //so we need to convert the Tag[] to the format {label: string, value: string}[]

                onChange={(tags) => {
                  setSelectedTags(
                    tags.map((tag) => {
                      return { label: tag.label, id: tag.value };
                    })
                  );
                }}
                //convert the tags from the CreatableReactSelect component to the format Tag[] so that we could use it
                //in the setSelectedTags function

                isMulti
                //allow the user to select multiple tags
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Form.Group controlId="markdown">
            <Form.Label>Body</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={15}
              ref={markdownRef}
              defaultValue={markdown}
            />
          </Form.Group>
        </Row>
        <Stack direction="horizontal" gap={2} className="justify-content-end">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Link to="..">
            <Button type="button" variant="outline-secondary">
              Cancel
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Form>
  );
}
