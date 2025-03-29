import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is the Mirage Ghibli AI model?",
    answer: "The Mirage Ghibli AI is a specialized image transformation model designed to convert ordinary photographs into images that mimic the distinctive artistic style of Studio Ghibli animations, known for their whimsical and unique aesthetic."
  },
  {
    question: "What type of images work best with this transformation?",
    answer: "Landscapes, nature scenes, and architectural images typically produce the best results. The AI model captures the essence of Ghibli's style most effectively with these types of images, but you can experiment with any photograph."
  },
  {
    question: "Is there a limit to how many images I can transform?",
    answer: "Free accounts can transform up to 5 images per day. Premium subscribers have higher or unlimited transformations, depending on their subscription level."
  },
  {
    question: "How long does the transformation process take?",
    answer: "Most transformations complete within 15-30 seconds, depending on server load and image complexity. Larger images may take slightly longer to process."
  }
];

export function FAQ() {
  return (
    <section>
      <h2 className="font-bold text-2xl mb-8 text-center">Frequently Asked Questions</h2>
      
      <div className="bg-white rounded-xl shadow-md">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="px-6 py-4 text-left font-semibold text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0 text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
